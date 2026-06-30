import { logActivity } from "@/lib/activityLogger";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type UserRole = "superadmin" | "dg" | "guide" | "chauffeur" | "restaurant" | "hotel" | "commercial" | "client";

export interface ClientUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  whatsapp: string;
  nationality: string;
  language: string;
  password: string;
  createdAt: string;
}

export interface StaffAccount {
  id: string;
  name: string;
  role: Exclude<UserRole, "superadmin" | "client">;
  identifier: string;
  password: string;
  permissions: string[];
  active: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface UnifiedSession {
  role: UserRole;
  name: string;
  identifier: string;
  loginTime: string;
  permissions?: string[];
  clientUser?: ClientUser;
  staffId?: string;
}

interface AuthContextType {
  session: UnifiedSession | null;
  login: (identifier: string, password: string) => Promise<UserRole | false>;
  register: (data: Omit<ClientUser, "id" | "createdAt">) => Promise<"ok" | "exists">;
  logout: () => void;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  showDashboard: boolean;
  setShowDashboard: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function buildSessionFromAuthUser(authUserId: string, email: string): Promise<UnifiedSession | null> {
  const { data: staffRow } = await supabase
    .from("staff_accounts")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (staffRow) {
    if (staffRow.role === "superadmin") {
      return {
        role: "superadmin",
        name: staffRow.name || "Admin",
        identifier: email,
        loginTime: new Date().toISOString(),
        permissions: staffRow.permissions,
        staffId: staffRow.id,
      };
    }
    return {
      role: staffRow.role,
      name: staffRow.name,
      identifier: email,
      loginTime: new Date().toISOString(),
      permissions: staffRow.permissions,
      staffId: staffRow.id,
    };
  }

  const { data: clientRow } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", authUserId)
    .maybeSingle();

  if (clientRow) {
    if (clientRow.banned) return null;

    await supabase.from("clients").update({ last_login: new Date().toISOString() }).eq("id", clientRow.id);

    const user: ClientUser = {
      id: clientRow.id,
      firstName: clientRow.first_name,
      lastName: clientRow.last_name,
      email: clientRow.email || "",
      whatsapp: clientRow.whatsapp,
      nationality: clientRow.nationality || "",
      language: clientRow.language || "FR",
      password: "",
      createdAt: clientRow.created_at,
    };
    return {
      role: "client",
      name: user.firstName + " " + user.lastName,
      identifier: email,
      loginTime: new Date().toISOString(),
      clientUser: user,
    };
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UnifiedSession | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const authUser = data.session?.user;
      if (authUser && authUser.email) {
        const s = await buildSessionFromAuthUser(authUser.id, authUser.email);
        if (s) setSession(s);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, authSession) => {
      const authUser = authSession?.user;
      if (authUser && authUser.email) {
        const s = await buildSessionFromAuthUser(authUser.id, authUser.email);
        setSession(s);
      } else {
        setSession(null);
      }
    });

    return () => { listener.subscription.unsubscribe(); };
  }, []);

  const login = async (identifier: string, password: string): Promise<UserRole | false> => {
    if (identifier === "admin" && password === "Bachirou1997@") {
      const s: UnifiedSession = {
        role: "superadmin",
        name: "Admin Maître",
        identifier: "admin",
        loginTime: new Date().toISOString(),
        permissions: [],
      };
      setSession(s);
      logActivity({ user_identifier: "admin", user_role: "superadmin", action: "login", target: "superadmin" });
      return "superadmin";
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (error || !data.user || !data.user.email) return false;

    const s = await buildSessionFromAuthUser(data.user.id, data.user.email);
    if (!s) {
      await supabase.auth.signOut();
      return false;
    }

    setSession(s);
    logActivity({ user_identifier: identifier, user_role: s.role, action: "login", target: s.role });
    return s.role;
  };

  const register = async (data: Omit<ClientUser, "id" | "createdAt">): Promise<"ok" | "exists"> => {
    if (!data.email) return "exists";

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError || !signUpData.user) return "exists";

    const { data: inserted, error: insertError } = await supabase
      .from("clients")
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        whatsapp: data.whatsapp,
        nationality: data.nationality,
        language: data.language,
        points: 0,
        banned: false,
        user_id: signUpData.user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError || !inserted) return "exists";

    const user: ClientUser = {
      id: inserted.id,
      firstName: inserted.first_name,
      lastName: inserted.last_name,
      email: inserted.email || "",
      whatsapp: inserted.whatsapp,
      nationality: inserted.nationality || "",
      language: inserted.language || "FR",
      password: "",
      createdAt: inserted.created_at,
    };

    const s: UnifiedSession = {
      role: "client",
      name: user.firstName + " " + user.lastName,
      identifier: user.email || user.whatsapp,
      loginTime: new Date().toISOString(),
      clientUser: user,
    };
    setSession(s);
    return "ok";
  };

  const logout = () => {
    logActivity({ user_identifier: session?.identifier || "unknown", user_role: session?.role || "unknown", action: "logout" });
    supabase.auth.signOut();
    setSession(null);
    setShowDashboard(false);
    setShowModal(false);
  };

  return (
    <AuthContext.Provider value={{ session, login, register, logout, showModal, setShowModal, showDashboard, setShowDashboard }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useAdminAuth() {
  const { session, logout, showDashboard, setShowDashboard } = useAuth();
  const isSuperAdmin = session?.role === "superadmin";
  const isStaff = session !== null && session.role !== "client";
  return {
    adminLogout: logout,
    showAdminDashboard: showDashboard && isStaff,
    isSuperAdmin,
    staffRole: isStaff ? session!.role : null,
  };
}

export function useClientAuth() {
  const { session, register, logout, showModal, setShowModal, showDashboard, setShowDashboard } = useAuth();
  const isClient = session?.role === "client";
  return {
    clientSession: isClient ? { user: session!.clientUser!, loginTime: session!.loginTime } : null,
    clientRegister: (data: Omit<ClientUser, "id" | "createdAt">) => register(data).then(r => r === "ok"),
    clientLogout: logout,
    showClientModal: showModal,
    setShowClientModal: setShowModal,
    showClientDashboard: showDashboard && isClient,
    setShowClientDashboard: (v: boolean) => { if (v) setShowDashboard(true); else if (isClient) setShowDashboard(false); },
  };
}

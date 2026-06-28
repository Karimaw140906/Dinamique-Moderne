import { logActivity } from "@/lib/activityLogger";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type UserRole = "superadmin" | "guide" | "chauffeur" | "restaurant" | "hotel" | "commercial" | "client";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UnifiedSession | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("userSession");
      if (saved) setSession(JSON.parse(saved));
    } catch {}
  }, []);

  const saveSession = (s: UnifiedSession) => {
    setSession(s);
    localStorage.setItem("userSession", JSON.stringify(s));
  };

  const login = async (identifier: string, password: string): Promise<UserRole | false> => {
    // 1. Super admin
    if (identifier === "admin" && password === "Bachirou1997@") {
      const s: UnifiedSession = { role: "superadmin", name: "Admin", identifier, loginTime: new Date().toISOString() };
      saveSession(s);
      logActivity({ user_identifier: identifier, user_role: "superadmin", action: "login", target: "superadmin" });
      return "superadmin";
    }

    // 2. Staff accounts — Supabase en priorité
    try {
      const { data: staffData, error: staffError } = await supabase.from("staff_accounts").select("*").or(`identifier.eq.${identifier},email.eq.${identifier}`);
      const staff: StaffAccount[] = (!staffError && staffData && staffData.length > 0) ? staffData : JSON.parse(localStorage.getItem("staffAccounts") || "[]");
      const match = staff.find((a) => a.identifier === identifier && a.password === password && a.active);
      if (match) {
        const s: UnifiedSession = {
          role: match.role, name: match.name, identifier,
          loginTime: new Date().toISOString(), permissions: match.permissions, staffId: match.id,
        };
        saveSession(s);
        logActivity({ user_identifier: identifier, user_role: match.role, action: "login", target: "staff" });
        return match.role;
      }
    } catch {}

    // 3. Clients — Supabase en priorité, localStorage en fallback
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .or(`email.eq.${identifier},whatsapp.eq.${identifier}`)
        .eq("password", password)
        .single();

      if (!error && data) {
        // Vérifier si banni
        if (data.banned) return false;

        // Mettre à jour last_login
        await supabase.from("clients").update({ last_login: new Date().toISOString() }).eq("id", data.id);

        const user: ClientUser = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email || "",
          whatsapp: data.whatsapp,
          nationality: data.nationality || "",
          language: data.language || "FR",
          password: data.password,
          createdAt: data.created_at,
        };
        const s: UnifiedSession = {
          role: "client", name: `${user.firstName} ${user.lastName}`,
          identifier, loginTime: new Date().toISOString(), clientUser: user,
        };
        saveSession(s);
        logActivity({ user_identifier: identifier, user_role: "client", action: "login", target: "client" });
        return "client";
      }
    } catch {}

    // Fallback localStorage clients
    try {
      const clients: ClientUser[] = JSON.parse(localStorage.getItem("samaClients") || "[]");
      const user = clients.find((c) => (c.email === identifier || c.whatsapp === identifier) && c.password === password);
      if (user) {
        const s: UnifiedSession = {
          role: "client", name: `${user.firstName} ${user.lastName}`,
          identifier, loginTime: new Date().toISOString(), clientUser: user,
        };
        saveSession(s);
        return "client";
      }
    } catch {}

    return false;
  };

  const register = async (data: Omit<ClientUser, "id" | "createdAt">): Promise<"ok" | "exists"> => {
    // Vérifier si existe déjà dans Supabase
    try {
      const { data: existing } = await supabase
        .from("clients")
        .select("id")
        .or(`whatsapp.eq.${data.whatsapp}${data.email ? `,email.eq.${data.email}` : ""}`)
        .single();

      if (existing) return "exists";

      // Insérer dans Supabase
      const { data: inserted, error } = await supabase
        .from("clients")
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email || null,
          whatsapp: data.whatsapp,
          nationality: data.nationality,
          language: data.language,
          password: data.password,
          points: 0,
          banned: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!error && inserted) {
        const user: ClientUser = {
          id: inserted.id,
          firstName: inserted.first_name,
          lastName: inserted.last_name,
          email: inserted.email || "",
          whatsapp: inserted.whatsapp,
          nationality: inserted.nationality || "",
          language: inserted.language || "FR",
          password: inserted.password,
          createdAt: inserted.created_at,
        };
        // Aussi sauvegarder en localStorage comme backup
        try {
          const clients = JSON.parse(localStorage.getItem("samaClients") || "[]");
          clients.push(user);
          localStorage.setItem("samaClients", JSON.stringify(clients));
        } catch {}

        const s: UnifiedSession = {
          role: "client", name: `${user.firstName} ${user.lastName}`,
          identifier: user.email || user.whatsapp, loginTime: new Date().toISOString(), clientUser: user,
        };
        saveSession(s);
        return "ok";
      }
    } catch {}

    // Fallback localStorage
    try {
      const clients: ClientUser[] = JSON.parse(localStorage.getItem("samaClients") || "[]");
      const exists = clients.find((c) => c.whatsapp === data.whatsapp || (data.email && c.email === data.email));
      if (exists) return "exists";
      const user: ClientUser = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
      clients.push(user);
      localStorage.setItem("samaClients", JSON.stringify(clients));
      const s: UnifiedSession = {
        role: "client", name: `${user.firstName} ${user.lastName}`,
        identifier: user.email || user.whatsapp, loginTime: new Date().toISOString(), clientUser: user,
      };
      saveSession(s);
      return "ok";
    } catch { return "exists"; }
  };

  const logout = () => {
    logActivity({ user_identifier: session?.identifier || "unknown", user_role: session?.role || "unknown", action: "logout" });
    setSession(null);
    localStorage.removeItem("userSession");
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

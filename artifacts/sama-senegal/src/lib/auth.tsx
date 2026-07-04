import { logActivity } from "@/lib/activityLogger";
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type UserRole =
  | "superadmin" | "dg"
  | "admin"
  | "responsable_destinations" | "responsable_hebergements" | "responsable_activites"
  | "responsable_restaurants" | "responsable_transport" | "responsable_evenements"
  | "responsable_contenus" | "agent"
  // legacy — conservés pour compatibilité des comptes existants, ne plus attribuer
  | "guide" | "guide_principal" | "chauffeur" | "restaurant" | "hotel" | "commercial"
  | "client";

export interface ClientUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  whatsapp: string;
  nationality: string;
  language: string;
  password: string;
  points?: number;
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

export interface PendingGoogleProfile {
  authUserId: string;
  email: string;
  suggestedFirstName: string;
  suggestedLastName: string;
}

interface AuthContextType {
  session: UnifiedSession | null;
  login: (identifier: string, password: string) => Promise<UserRole | false>;
  register: (data: Omit<ClientUser, "id" | "createdAt">) => Promise<"ok" | "exists">;
  loginWithGoogle: () => Promise<void>;
  pendingGoogleProfile: PendingGoogleProfile | null;
  completeGoogleProfile: (data: { whatsapp: string; nationality: string; language: string }) => Promise<boolean>;
  cancelGoogleProfile: () => void;
  logout: () => void;
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  showDashboard: boolean;
  setShowDashboard: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// COMPTES DIRECTS — Admin & DG (connexion directe, sans Supabase)
// ============================================================
const DIRECT_ACCOUNTS: Record<string, { password: string; role: UserRole; name: string }> = {
  "admin": { password: import.meta.env.VITE_ADMIN_PASSWORD || "", role: "superadmin", name: "Admin Maître" },
  "DG": { password: import.meta.env.VITE_DG_PASSWORD || "", role: "dg", name: "Directeur Général" },
};

const DIRECT_SESSION_KEY = "sama_direct_session";

function loadDirectSession(): UnifiedSession | null {
  try {
    const raw = localStorage.getItem(DIRECT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.role && parsed.identifier) return parsed as UnifiedSession;
    return null;
  } catch {
    return null;
  }
}

function saveDirectSession(s: UnifiedSession | null) {
  try {
    if (s) localStorage.setItem(DIRECT_SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(DIRECT_SESSION_KEY);
  } catch {
    // stockage indisponible -> la session reste seulement en memoire
  }
}

// ============================================================
// Résolution de session via Supabase (staff_accounts / clients)
// Gère 3 cas : session trouvée, compte banni, ou nouveau compte
// (ex: premier login Google) sans profil "clients" encore créé.
// ============================================================
type ResolveResult =
  | { kind: "session"; session: UnifiedSession }
  | { kind: "banned" }
  | { kind: "new"; authUserId: string; email: string; suggestedFirstName: string; suggestedLastName: string };

async function resolveAuthUser(authUserId: string, email: string, meta?: Record<string, any>): Promise<ResolveResult> {
  const { data: staffRow } = await supabase
    .from("staff_accounts")
    .select("*")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (staffRow) {
    return {
      kind: "session",
      session: {
        role: staffRow.role === "superadmin" ? "superadmin" : staffRow.role,
        name: staffRow.name || "Admin",
        identifier: email,
        loginTime: new Date().toISOString(),
        permissions: staffRow.permissions,
        staffId: staffRow.id,
      },
    };
  }

  const { data: clientRow } = await supabase
    .from("clients")
    .select("*")
    .eq("user_id", authUserId)
    .maybeSingle();

  if (clientRow) {
    if (clientRow.banned) return { kind: "banned" };

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
      kind: "session",
      session: {
        role: "client",
        name: user.firstName + " " + user.lastName,
        identifier: email,
        loginTime: new Date().toISOString(),
        clientUser: user,
      },
    };
  }

  // Aucun profil trouvé -> nouveau compte (ex: 1er login Google), profil à compléter
  const fullName = (meta?.full_name || meta?.name || "").trim();
  const [suggestedFirstName, ...rest] = fullName.split(" ").filter(Boolean);
  return {
    kind: "new",
    authUserId,
    email,
    suggestedFirstName: suggestedFirstName || "",
    suggestedLastName: rest.join(" ") || "",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UnifiedSession | null>(() => loadDirectSession());
  const [pendingGoogleProfile, setPendingGoogleProfile] = useState<PendingGoogleProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const isDirectSession = useRef<boolean>(!!loadDirectSession());

  useEffect(() => {
    // Si une session directe (Admin/DG) est deja active, on ne laisse pas
    // Supabase l'ecraser au montage ni via les evenements d'auth.
    supabase.auth.getSession().then(async ({ data }) => {
      if (isDirectSession.current) return;
      const authUser = data.session?.user;
      if (authUser && authUser.email) {
        const r = await resolveAuthUser(authUser.id, authUser.email, authUser.user_metadata);
        if (r.kind === "session") setSession(r.session);
        else if (r.kind === "new") setPendingGoogleProfile(r);
        else await supabase.auth.signOut();
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, authSession) => {
      if (isDirectSession.current) return;
      const authUser = authSession?.user;
      if (authUser && authUser.email) {
        const r = await resolveAuthUser(authUser.id, authUser.email, authUser.user_metadata);
        if (r.kind === "session") {
          setSession(r.session);
          setPendingGoogleProfile(null);
        } else if (r.kind === "new") {
          setPendingGoogleProfile(r);
        } else {
          await supabase.auth.signOut();
          setSession(null);
        }
      } else {
        setSession(null);
      }
    });

    return () => { listener.subscription.unsubscribe(); };
  }, []);

  const login = async (identifier: string, password: string): Promise<UserRole | false> => {
    // 1) Comptes directs Admin / DG
    const direct = DIRECT_ACCOUNTS[identifier];
    if (direct && direct.password === password) {
      const s: UnifiedSession = {
        role: direct.role,
        name: direct.name,
        identifier,
        loginTime: new Date().toISOString(),
        permissions: [],
      };
      isDirectSession.current = true;
      setSession(s);
      saveDirectSession(s);
      logActivity({ user_identifier: identifier, user_role: direct.role, action: "login", target: direct.role });
      return direct.role;
    }

    // 2) Sinon, flux Client (et staff residuel) inchange via Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (error || !data.user || !data.user.email) return false;

    const r = await resolveAuthUser(data.user.id, data.user.email, data.user.user_metadata);
    if (r.kind !== "session") {
      await supabase.auth.signOut();
      return false;
    }

    isDirectSession.current = false;
    saveDirectSession(null);
    setSession(r.session);
    logActivity({ user_identifier: identifier, user_role: r.session.role, action: "login", target: r.session.role });
    return r.session.role;
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
    isDirectSession.current = false;
    saveDirectSession(null);
    setSession(s);
    return "ok";
  };

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const completeGoogleProfile = async (data: { whatsapp: string; nationality: string; language: string }): Promise<boolean> => {
    if (!pendingGoogleProfile) return false;
    const { authUserId, email, suggestedFirstName, suggestedLastName } = pendingGoogleProfile;

    const { data: inserted, error } = await supabase
      .from("clients")
      .insert({
        first_name: suggestedFirstName || email.split("@")[0],
        last_name: suggestedLastName || "",
        email,
        whatsapp: data.whatsapp,
        nationality: data.nationality,
        language: data.language,
        password: "",
        points: 0,
        banned: false,
        user_id: authUserId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !inserted) return false;

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

    setSession({
      role: "client",
      name: user.firstName + " " + user.lastName,
      identifier: email,
      loginTime: new Date().toISOString(),
      clientUser: user,
    });
    setPendingGoogleProfile(null);
    return true;
  };

  const cancelGoogleProfile = () => {
    setPendingGoogleProfile(null);
    supabase.auth.signOut();
  };

  const logout = () => {
    logActivity({ user_identifier: session?.identifier || "unknown", user_role: session?.role || "unknown", action: "logout" });
    isDirectSession.current = false;
    saveDirectSession(null);
    supabase.auth.signOut();
    setSession(null);
    setShowDashboard(false);
    setShowModal(false);
  };

  return (
    <AuthContext.Provider value={{
      session, login, register, loginWithGoogle, pendingGoogleProfile, completeGoogleProfile, cancelGoogleProfile,
      logout, showModal, setShowModal, showDashboard, setShowDashboard,
    }}>
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
  const {
    session, register, logout, showModal, setShowModal, showDashboard, setShowDashboard,
    loginWithGoogle, pendingGoogleProfile, completeGoogleProfile, cancelGoogleProfile,
  } = useAuth();
  const isClient = session?.role === "client";
  return {
    clientSession: isClient ? { user: session!.clientUser!, loginTime: session!.loginTime } : null,
    clientRegister: (data: Omit<ClientUser, "id" | "createdAt">) => register(data).then(r => r === "ok"),
    clientLogout: logout,
    showClientModal: showModal,
    setShowClientModal: setShowModal,
    showClientDashboard: showDashboard && isClient,
    setShowClientDashboard: (v: boolean) => { if (v) setShowDashboard(true); else if (isClient) setShowDashboard(false); },
    loginWithGoogle,
    pendingGoogleProfile,
    completeGoogleProfile,
    cancelGoogleProfile,
  };
}

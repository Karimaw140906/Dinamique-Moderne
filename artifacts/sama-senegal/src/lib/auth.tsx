import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  login: (identifier: string, password: string) => UserRole | false;
  register: (data: Omit<ClientUser, "id" | "createdAt">) => "ok" | "exists";
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
    // Migrate old sessions
    try {
      const old = localStorage.getItem("adminSession");
      if (old && !localStorage.getItem("userSession")) {
        const s: UnifiedSession = { role: "superadmin", name: "Admin", identifier: "admin", loginTime: new Date().toISOString() };
        setSession(s);
        localStorage.setItem("userSession", JSON.stringify(s));
      }
    } catch {}
    try {
      const old = localStorage.getItem("clientSession");
      if (old && !localStorage.getItem("userSession")) {
        const parsed = JSON.parse(old);
        if (parsed?.user) {
          const u = parsed.user as ClientUser;
          const s: UnifiedSession = { role: "client", name: `${u.firstName} ${u.lastName}`, identifier: u.email || u.whatsapp, loginTime: parsed.loginTime, clientUser: u };
          setSession(s);
          localStorage.setItem("userSession", JSON.stringify(s));
        }
      }
    } catch {}
  }, []);

  const saveSession = (s: UnifiedSession) => {
    setSession(s);
    localStorage.setItem("userSession", JSON.stringify(s));
  };

  const login = (identifier: string, password: string): UserRole | false => {
    // 1. Super admin
    if (identifier === "admin" && password === "Bachirou1997@") {
      const s: UnifiedSession = { role: "superadmin", name: "Admin", identifier, loginTime: new Date().toISOString() };
      saveSession(s);
      return "superadmin";
    }

    // 2. Staff accounts
    try {
      const staff: StaffAccount[] = JSON.parse(localStorage.getItem("staffAccounts") || "[]");
      const match = staff.find((a) => a.identifier === identifier && a.password === password && a.active);
      if (match) {
        match.lastLogin = new Date().toISOString();
        localStorage.setItem("staffAccounts", JSON.stringify(staff));
        const s: UnifiedSession = {
          role: match.role, name: match.name, identifier,
          loginTime: new Date().toISOString(), permissions: match.permissions, staffId: match.id,
        };
        saveSession(s);
        return match.role;
      }
    } catch {}

    // 3. Clients
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

  const register = (data: Omit<ClientUser, "id" | "createdAt">): "ok" | "exists" => {
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
    setSession(null);
    localStorage.removeItem("userSession");
    localStorage.removeItem("adminSession");
    localStorage.removeItem("clientSession");
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

// Backward-compat: components that use useClientAuth still work
export function useClientAuth() {
  const { session, register, logout, showModal, setShowModal, showDashboard, setShowDashboard } = useAuth();
  const isClient = session?.role === "client";
  return {
    clientSession: isClient ? { user: session!.clientUser!, loginTime: session!.loginTime } : null,
    clientLogin: () => false as boolean,
    clientRegister: (data: Omit<ClientUser, "id" | "createdAt">) => register(data) === "ok",
    clientLogout: logout,
    showClientModal: showModal,
    setShowClientModal: setShowModal,
    showClientDashboard: showDashboard && isClient,
    setShowClientDashboard: (v: boolean) => { if (v) setShowDashboard(true); else if (isClient) setShowDashboard(false); },
  };
}

// Backward-compat: components that use useAdminAuth still work
export function useAdminAuth() {
  const { session, logout, showDashboard, setShowDashboard } = useAuth();
  const isSuperAdmin = session?.role === "superadmin";
  const isStaff = session !== null && session.role !== "client";
  return {
    adminSession: isSuperAdmin ? { username: "admin", loginTime: session!.loginTime } : null,
    adminLogin: () => false as boolean,
    adminLogout: logout,
    showAdminLogin: false,
    setShowAdminLogin: (_v: boolean) => {},
    showAdminDashboard: showDashboard && isStaff,
    setShowAdminDashboard: (v: boolean) => setShowDashboard(v),
    isSuperAdmin,
    staffRole: isStaff ? session!.role : null,
  };
}

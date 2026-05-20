import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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

interface ClientSession {
  user: ClientUser;
  loginTime: string;
}

interface ClientAuthContextType {
  clientSession: ClientSession | null;
  clientLogin: (identifier: string, password: string) => boolean;
  clientRegister: (data: Omit<ClientUser, "id" | "createdAt">) => boolean;
  clientLogout: () => void;
  showClientModal: boolean;
  setShowClientModal: (v: boolean) => void;
  showClientDashboard: boolean;
  setShowClientDashboard: (v: boolean) => void;
}

interface AdminSession {
  username: string;
  loginTime: string;
}

interface AdminAuthContextType {
  adminSession: AdminSession | null;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
  showAdminLogin: boolean;
  setShowAdminLogin: (v: boolean) => void;
  showAdminDashboard: boolean;
  setShowAdminDashboard: (v: boolean) => void;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [clientSession, setClientSession] = useState<ClientSession | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showClientDashboard, setShowClientDashboard] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("clientSession");
      if (saved) setClientSession(JSON.parse(saved));
    } catch {}
    try {
      const saved = localStorage.getItem("adminSession");
      if (saved) setAdminSession(JSON.parse(saved));
    } catch {}
  }, []);

  const getClients = (): ClientUser[] => {
    try { return JSON.parse(localStorage.getItem("samaClients") || "[]"); } catch { return []; }
  };

  const clientLogin = (identifier: string, password: string): boolean => {
    const clients = getClients();
    const user = clients.find(
      (c) => (c.email === identifier || c.whatsapp === identifier) && c.password === password
    );
    if (user) {
      const session: ClientSession = { user, loginTime: new Date().toISOString() };
      setClientSession(session);
      localStorage.setItem("clientSession", JSON.stringify(session));
      return true;
    }
    return false;
  };

  const clientRegister = (data: Omit<ClientUser, "id" | "createdAt">): boolean => {
    const clients = getClients();
    const exists = clients.find(
      (c) => c.whatsapp === data.whatsapp || (data.email && c.email === data.email)
    );
    if (exists) return false;
    const user: ClientUser = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
    clients.push(user);
    localStorage.setItem("samaClients", JSON.stringify(clients));
    const session: ClientSession = { user, loginTime: new Date().toISOString() };
    setClientSession(session);
    localStorage.setItem("clientSession", JSON.stringify(session));
    return true;
  };

  const clientLogout = () => {
    setClientSession(null);
    localStorage.removeItem("clientSession");
  };

  const adminLogin = (username: string, password: string): boolean => {
    if (username === "admin" && password === "Bachirou1997") {
      const session: AdminSession = { username, loginTime: new Date().toISOString() };
      setAdminSession(session);
      localStorage.setItem("adminSession", JSON.stringify(session));
      setShowAdminLogin(false);
      setShowAdminDashboard(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setAdminSession(null);
    localStorage.removeItem("adminSession");
    setShowAdminDashboard(false);
  };

  return (
    <ClientAuthContext.Provider
      value={{ clientSession, clientLogin, clientRegister, clientLogout, showClientModal, setShowClientModal, showClientDashboard, setShowClientDashboard }}
    >
      <AdminAuthContext.Provider
        value={{ adminSession, adminLogin, adminLogout, showAdminLogin, setShowAdminLogin, showAdminDashboard, setShowAdminDashboard }}
      >
        {children}
      </AdminAuthContext.Provider>
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) throw new Error("useClientAuth must be used within AuthProvider");
  return ctx;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AuthProvider");
  return ctx;
}

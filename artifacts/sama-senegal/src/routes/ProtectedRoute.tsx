import { ReactNode } from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/lib/auth";

type AllowedRole = "client" | "staff" | "superadmin" | "dg";

const STAFF_ROLES = ["guide", "guide_principal", "chauffeur", "restaurant", "hotel", "commercial"];

export function ProtectedRoute({
  children,
  allow,
}: {
  children: ReactNode;
  allow: AllowedRole[];
}) {
  const { session } = useAuth();

  if (!session) {
    return <Redirect to="/" />;
  }

  const isClient = session.role === "client";
  const isStaff = STAFF_ROLES.includes(session.role);
  const isSuperAdmin = session.role === "superadmin";
  const isDG = session.role === "dg";

  const isAllowed =
    (allow.includes("client") && isClient) ||
    (allow.includes("staff") && (isStaff || isSuperAdmin || isDG)) ||
    (allow.includes("superadmin") && (isSuperAdmin || isDG)) ||
    (allow.includes("dg") && isDG);

  if (!isAllowed) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

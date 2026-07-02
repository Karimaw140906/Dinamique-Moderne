import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

export default function PrestataireDashboard() {
  const [, setLocation] = useLocation();
  const { setShowDashboard } = useAuth();

  useEffect(() => {
    setShowDashboard(true);
    setLocation("/");
  }, []);

  return null;
}

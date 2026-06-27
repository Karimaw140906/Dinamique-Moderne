import { supabase } from "@/lib/supabase";

export async function logActivity({
  user_identifier,
  user_role,
  action,
  target,
  details,
}: {
  user_identifier: string;
  user_role: string;
  action: string;
  target?: string;
  details?: Record<string, any>;
}) {
  try {
    await supabase.from("activity_logs").insert([{
      user_identifier,
      user_role,
      action,
      target: target || null,
      details: details || null,
      created_at: new Date().toISOString(),
    }]);
  } catch {}
  // localStorage backup
  try {
    const logs = JSON.parse(localStorage.getItem("activityLogs") || "[]");
    logs.unshift({ user_identifier, user_role, action, target, details, created_at: new Date().toISOString() });
    localStorage.setItem("activityLogs", JSON.stringify(logs.slice(0, 200)));
  } catch {}
}

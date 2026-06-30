import { supabase } from "@/lib/supabase";

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "normal" | "high" | "urgent";

export interface TaskInput {
  title: string;
  description?: string;
  assignedTo?: string;
  createdBy: string;
  relatedBookingRef?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export async function createTask(input: TaskInput): Promise<boolean> {
  try {
    const { error } = await supabase.from("internal_tasks").insert({
      title: input.title,
      description: input.description || null,
      assigned_to: input.assignedTo || null,
      created_by: input.createdBy,
      related_booking_ref: input.relatedBookingRef || null,
      priority: input.priority || "normal",
      due_date: input.dueDate || null,
      status: "todo" as TaskStatus,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function getTasks(assignedTo?: string, status?: TaskStatus): Promise<any[]> {
  try {
    let query = supabase.from("internal_tasks").select("*").order("created_at", { ascending: false });
    if (assignedTo) query = query.eq("assigned_to", assignedTo);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (!error && data) return data;
  } catch {}
  return [];
}

export async function updateTaskStatus(taskId: number, status: TaskStatus): Promise<void> {
  try {
    const updates: any = { status };
    if (status === "done") updates.completed_at = new Date().toISOString();
    await supabase.from("internal_tasks").update(updates).eq("id", taskId);
  } catch {}
}

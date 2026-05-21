import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tsfgnfxxrigmmbkovhlg.supabase.co";
const supabaseKey = "sb_publishable_jH3fEeQrXYdFiqYBhRwWFQ__A3wuQ3-";

export const supabase = createClient(supabaseUrl, supabaseKey);

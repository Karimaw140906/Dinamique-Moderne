import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tsfgnfxxrigmmbkovhlg.supabase.co";
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZmduZnh4cmlnbW1ia292aGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzOTE4MzMsImV4cCI6MjA5NDk2NzgzM30.hkUAXkTdxVm0L06ybmy1Fob_363nGLPz_CfcqNJ_Hw4';

export const supabase = createClient(supabaseUrl, supabaseKey);

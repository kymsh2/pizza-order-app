import { createClient } from "@supabase/supabase-js";

const SUPABASE_REALTIME_URL =
  process.env.EXPO_PUBLIC_SUBABASE_REALTIME_URL_BASE || "";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const supabase = createClient(
  SUPABASE_REALTIME_URL,
  SUPABASE_PUBLISHABLE_KEY
);

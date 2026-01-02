import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const SUBABASE_URL_BASE =
  Constants.expoConfig?.extra?.env?.SUBABASE_URL_BASE || "";
const SUPABASE_PUBLISHABLE_KEY =
  Constants.expoConfig?.extra?.env?.SUPABASE_PUBLISHABLE_KEY || "";

if (!SUBABASE_URL_BASE || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Environment variables for supabase url and supabase key are not set."
  );
}

export const supabase = createClient(
  SUBABASE_URL_BASE,
  SUPABASE_PUBLISHABLE_KEY
);

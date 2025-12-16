// backend/src/lib/supabase.js

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✅ Correct validation logic
if (!supabaseUrl || (!supabaseAnonKey && !supabaseServiceKey)) {
  console.error("❌ Missing Supabase environment variables:");

  if (!supabaseUrl) console.error("  - SUPABASE_URL is not defined");
  if (!supabaseAnonKey && !supabaseServiceKey) {
    console.error(
      "  - Neither SUPABASE_ANON_KEY nor SUPABASE_SERVICE_ROLE_KEY is defined"
    );
  }

  process.exit(1);
}

// Logs for debugging (safe)
console.log("✅ Supabase URL loaded");
console.log(
  "🔑 Supabase Key:",
  supabaseServiceKey ? "Service Role (server)" : "Anon (fallback)"
);

// ✅ Use service role key on backend if available
const keyToUse = supabaseServiceKey || supabaseAnonKey;

// Main client (used everywhere)
export const supabase = createClient(supabaseUrl, keyToUse);

// Optional admin client (future use)
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase;

// Unified error helper
export const handleSupabaseError = (res, error) => {
  return res.status(error?.status || 500).json({
    message: error?.message || "Database error",
  });
};

// DEPENDENCIES
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:');
  if (!supabaseUrl) console.error('  - SUPABASE_URL is not defined');
  if (!supabaseAnonKey) console.error('  - SUPABASE_ANON_KEY is not defined');
  process.exit(1);
}

console.log("Supabase URL:", supabaseUrl ? "Loaded" : "Not Loaded");
console.log("Supabase Anon Key:", supabaseAnonKey ? "Loaded" : "Not Loaded");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const handleSupabaseError = (res, error) => {
    const status = error.status || 400;
    return res.status(status).json({
      error: error.message || "Authentication error",
    });
  };
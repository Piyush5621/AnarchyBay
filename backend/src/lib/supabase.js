// DEPENDENCIES
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:');
  if (!supabaseUrl) console.error('  - SUPABASE_URL is not defined');
  if (!supabaseAnonKey) console.error('  - SUPABASE_ANON_KEY is not defined');
  process.exit(1);
}

// console.log("Supabase URL:", supabaseUrl ? "Loaded" : "Not Loaded");
// console.log("Supabase Anon Key:", supabaseAnonKey ? "Loaded (anon)" : "Not Loaded");
// console.log("Supabase Service Key:", supabaseServiceKey ? "Loaded (service)" : "Not Loaded");

// Prefer service role key on server for authorized operations, fallback to anon key
const keyToUse = supabaseServiceKey || supabaseAnonKey;
export const supabase = createClient(supabaseUrl, keyToUse);

// Admin client with service role key for auth operations
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

export const handleSupabaseError = (res, error) => {
    const status = error.status || 400;
    return res.status(status).json({
      error: error.message || "Authentication error",
    });
  };

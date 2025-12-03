import { createClient } from '@supabase/supabase-js';

// Supabase client setup (for real-time features, auth, storage)
export const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  : null;

// Admin client for server-side operations
export const supabaseAdmin = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

if (supabase) {
  console.log("🔌 Supabase client: Connected");
  console.log("🔧 Supabase admin: ", supabaseAdmin ? "Connected" : "Not configured");
} else {
  console.log("🔌 Supabase: Not configured (using Neon for database)");
}
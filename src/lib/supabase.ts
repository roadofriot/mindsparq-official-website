import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  typeof supabaseUrl === 'string' &&
  supabaseUrl.startsWith('http') &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 20
);

if (!isSupabaseConfigured) {
  console.warn(
    '[MindSparQ Supabase] Configuration missing or incomplete. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env or hosting environment.'
  );
}

// Fallback dummy client if credentials not yet configured to prevent unhandled app crashes
const dummyUrl = 'https://placeholder-mindsparq.supabase.co';
const dummyKey = 'placeholder-anon-key-min-length-check';

export const supabase: SupabaseClient = createClient(
  (isSupabaseConfigured && supabaseUrl) ? supabaseUrl : dummyUrl,
  (isSupabaseConfigured && supabaseAnonKey) ? supabaseAnonKey : dummyKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

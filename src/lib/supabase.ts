import { createClient, SupabaseClient } from '@supabase/supabase-js';

function sanitizeEnvValue(val?: unknown): string {
  if (!val || typeof val !== 'string') return '';
  let cleaned = val.trim();
  // Strip accidental prefixes like 'Value: ' or 'Key: ' copied from dashboards
  cleaned = cleaned.replace(/^(Value|Key|AnonKey|PublishableKey):\s*/i, '').trim();
  // Strip surrounding quotes if accidentally included
  cleaned = cleaned.replace(/^["']|["']$/g, '').trim();
  return cleaned;
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = sanitizeEnvValue(rawUrl);
const supabaseAnonKey = sanitizeEnvValue(rawAnonKey);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
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

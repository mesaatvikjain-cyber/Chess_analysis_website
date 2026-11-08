import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim();

const isPublishableKey = supabaseKey?.startsWith('sb_publishable_') ?? false;
const isLegacyAnonKey = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(supabaseKey ?? '');
const isSecretKey = supabaseKey?.startsWith('sb_secret_') ?? false;

export const supabaseConfigurationError = !supabaseUrl
  ? 'Supabase project URL is missing. Add VITE_SUPABASE_URL to .env.local.'
  : isSecretKey
    ? 'A secret or service-role key cannot be used in this browser app. Use a Supabase publishable key instead.'
    : !supabaseKey
      ? 'Supabase key is missing. Add VITE_SUPABASE_PUBLISHABLE_KEY to .env.local.'
      : !isPublishableKey && !isLegacyAnonKey
        ? 'The key in .env.local is not a recognized public Supabase key. Copy the full publishable key (starts with sb_publishable_) or legacy anon key from Project Settings → API Keys.'
        : '';
export const supabaseConfigured = !supabaseConfigurationError;
export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
  : null;

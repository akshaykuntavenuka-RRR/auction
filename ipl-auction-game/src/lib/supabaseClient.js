import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const isRealSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  if (!url || !key) return false;
  if (
    url.includes('your-supabase-url') ||
    url.includes('PASTE_YOUR_PROJECT_URL_HERE') ||
    url.includes('placeholder') ||
    key === 'placeholder'
  ) {
    return false;
  }
  return true;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


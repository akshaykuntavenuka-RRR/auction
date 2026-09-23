import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL = 'https://ejxjayzbkejsewuvcrxw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqeGpheXpia2Vqc2V3dXZjcnh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4Mzk3MTEsImV4cCI6MjA5NDQxNTcxMX0.lJceE7o3pHknH5NLrvw5TDj_Z7KIHspcDYDpuXusYHI';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isRealSupabaseConfigured = () => {
  const url = supabaseUrl || '';
  const key = supabaseAnonKey || '';
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


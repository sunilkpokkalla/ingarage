import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const safeUrl = url && url.startsWith('http') ? url : 'https://placeholder.supabase.co';
  const safeKey = key || 'placeholder';

  return createBrowserClient(safeUrl, safeKey)
}

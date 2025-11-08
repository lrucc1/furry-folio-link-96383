import { supabase } from '@/integrations/supabase/client';

export async function invokeWithAuth<T = any>(
  fn: string, 
  init?: { method?: 'GET' | 'POST', body?: any }
) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('No auth session. Please sign in.');

  const { data, error } = await supabase.functions.invoke<T>(fn, {
    method: init?.method ?? 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: init?.body ?? {},
  });

  if (error) throw new Error(error.message ?? 'Function call failed');
  return data as T;
}

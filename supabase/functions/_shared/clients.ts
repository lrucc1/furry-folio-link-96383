import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const must = (k: string) => {
  const v = Deno.env.get(k);
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
};

export const makeAnonClient = (authHeader?: string) =>
  createClient(must('SUPABASE_URL'), must('SUPABASE_ANON_KEY'), {
    global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
  });

export const makeServiceClient = () =>
  createClient(must('SUPABASE_URL'), must('SUPABASE_SERVICE_ROLE_KEY'));

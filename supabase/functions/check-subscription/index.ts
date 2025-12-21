// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { buildCors, json } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: buildCors(req) });

  try {
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization') ?? '';
    if (!authHeader) return json(req, { error: 'Auth session missing!' }, 401);

    // Create client with user's auth header to validate their JWT
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the user from their JWT token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error('Auth validation error:', userError?.message ?? 'No user found');
      return json(req, { error: 'Auth session missing!' }, 401);
    }

    // Use service client for database queries (bypasses RLS)
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: profile, error } = await serviceClient
      .from('profiles')
      .select('plan_v2, subscription_status, trial_end_at')
      .eq('id', user.id)
      .single();
    if (error) return json(req, { error: `Profile fetch failed: ${error.message}` }, 500);

    const isPro = profile?.plan_v2 === 'PRO' || profile?.subscription_status === 'active';

    return json(req, {
      ok: true,
      is_pro: isPro,
      plan: profile?.plan_v2 ?? 'FREE',
      trial_ends_at: profile?.trial_end_at ?? null,
    });
  } catch (e: any) {
    console.error('check-subscription error', e);
    return json(req, { error: String(e?.message ?? e) }, 500);
  }
});

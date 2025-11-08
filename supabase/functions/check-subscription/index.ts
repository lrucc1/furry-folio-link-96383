// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { buildCors, json } from '../_shared/cors.ts';
import { makeAnonClient, makeServiceClient } from '../_shared/clients.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: buildCors(req) });

  try {
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return json(req, { error: 'Auth session missing!' }, 401);

    const sb = makeAnonClient(authHeader);
    const { data: { user }, error: uerr } = await sb.auth.getUser();
    if (uerr || !user) return json(req, { error: 'Auth session missing!' }, 401);

    const svc = makeServiceClient();
    const { data: profile, error } = await svc
      .from('profiles')
      .select('is_pro, plan, trial_ends_at, stripe_subscription_id')
      .eq('id', user.id)
      .single();
    if (error) return json(req, { error: `Profile fetch failed: ${error.message}` }, 500);

    return json(req, {
      ok: true,
      is_pro: !!profile?.is_pro,
      plan: profile?.plan ?? 'free',
      trial_ends_at: profile?.trial_ends_at ?? null,
      stripe_subscription_id: profile?.stripe_subscription_id ?? null,
    });
  } catch (e: any) {
    console.error('check-subscription error', e);
    return json(req, { error: String(e?.message ?? e) }, 500);
  }
});

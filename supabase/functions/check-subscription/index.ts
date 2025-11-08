// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { buildCors, json } from '../_shared/cors.ts';
import { makeAnonClient, makeServiceClient } from '../_shared/clients.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: buildCors(req) });

  try {
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return json(req, { error: 'Auth session missing!' }, 401);

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const svc = makeServiceClient();
    const { data: { user }, error: uerr } = await svc.auth.getUser(token);
    if (uerr || !user) return json(req, { error: 'Auth session missing!' }, 401);

    const { data: profile, error } = await svc
      .from('profiles')
      .select('plan_v2, subscription_status, trial_end_at, stripe_subscription_id')
      .eq('id', user.id)
      .single();
    if (error) return json(req, { error: `Profile fetch failed: ${error.message}` }, 500);

    const isPro = profile?.plan_v2 === 'PRO' || profile?.subscription_status === 'active';

    return json(req, {
      ok: true,
      is_pro: isPro,
      plan: profile?.plan_v2 ?? 'FREE',
      trial_ends_at: profile?.trial_end_at ?? null,
      stripe_subscription_id: profile?.stripe_subscription_id ?? null,
    });
  } catch (e: any) {
    console.error('check-subscription error', e);
    return json(req, { error: String(e?.message ?? e) }, 500);
  }
});

// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, json } from '../_shared/cors.ts';
import { makeServiceClient } from '../_shared/clients.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const svc = makeServiceClient();
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization') ?? '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return json({ error: 'Auth session missing!' }, 401);

    const { data: { user }, error: userErr } = await svc.auth.getUser(token);
    if (userErr || !user) return json({ error: 'Auth session missing!' }, 401);
    const { data: profile, error } = await svc
      .from('profiles')
      .select('is_pro, plan, trial_ends_at, stripe_subscription_id')
      .eq('id', user.id)
      .single();

    if (error) return json({ error: `Profile fetch failed: ${error.message}` }, 500);

    return json({
      ok: true,
      is_pro: !!profile?.is_pro,
      plan: profile?.plan ?? 'free',
      trial_ends_at: profile?.trial_ends_at,
      stripe_subscription_id: profile?.stripe_subscription_id ?? null,
    });
  } catch (e: any) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

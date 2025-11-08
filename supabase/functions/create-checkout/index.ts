// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@15.12.0?target=deno';
import { corsHeaders, json } from '../_shared/cors.ts';
import { makeAnonClient, makeServiceClient } from '../_shared/clients.ts';

const must = (k: string) => {
  const v = Deno.env.get(k);
  if (!v) throw new Error(`Missing env: ${k}`);
  return v;
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Missing Authorization Bearer token' }, 401);

    const sb = makeAnonClient(authHeader);
    const { data: { user }, error: userErr } = await sb.auth.getUser();
    if (userErr || !user) return json({ error: 'User not authenticated' }, 401);

    const stripe = new Stripe(must('STRIPE_SECRET_KEY'), { apiVersion: '2023-10-16' });
    const svc = makeServiceClient();

    // Get profile and ensure Stripe customer
    const { data: profile, error: pErr } = await svc
      .from('profiles')
      .select('id,email,stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (pErr) return json({ error: `Profile fetch failed: ${pErr.message}` }, 500);

    const email = profile?.email ?? user.email ?? undefined;
    let customerId = profile?.stripe_customer_id as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { supabase_user_id: user.id } });
      customerId = customer.id;
      const { error: upErr } = await svc.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
      if (upErr) return json({ error: `Profile update failed: ${upErr.message}` }, 500);
    }

    const priceId = must('STRIPE_PRICE_ID_PRO_MONTHLY');

    // Derive origin safely
    const referer = req.headers.get('referer') ?? '';
    const origin = (() => {
      try { return new URL(referer).origin; } catch { return 'https://petlinkid.com'; }
    })();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      allow_promotion_codes: true,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
      },
      success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade/cancelled`,
    });

    return json({ url: session.url }, 200);
  } catch (e: any) {
    return json({ error: String(e?.message ?? e) }, 500);
  }
});

// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@15.12.0?target=deno';
import { buildCors, json } from '../_shared/cors.ts';
import { makeAnonClient, makeServiceClient, must } from '../_shared/clients.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: buildCors(req) });

  try {
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return json(req, { error: 'Missing Authorization Bearer token' }, 401);

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const svc = makeServiceClient();
    const { data: { user }, error: uerr } = await svc.auth.getUser(token);
    if (uerr || !user) return json(req, { error: 'User not authenticated' }, 401);

    // Get priceId or billingPeriod from request body
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const billingPeriod = body.billingPeriod || 'monthly';
    
    // Priority: explicit priceId > billingPeriod-based selection > fallback
    let priceId = body.priceId;
    if (!priceId) {
      if (billingPeriod === 'yearly') {
        priceId = Deno.env.get('STRIPE_PRICE_ID_PRO_YEARLY') || must('STRIPE_PRICE_ID_PRO_MONTHLY');
      } else {
        priceId = must('STRIPE_PRICE_ID_PRO_MONTHLY');
      }
    }
    console.log('Using price ID:', priceId, 'for billing period:', billingPeriod);

    const stripe = new Stripe(must('STRIPE_SECRET_KEY'), { apiVersion: '2023-10-16' });

    // ensure profile + customer
    const { data: profile, error: perr } = await svc
      .from('profiles')
      .select('id,email,stripe_customer_id')
      .eq('id', user.id)
      .single();
    if (perr) return json(req, { error: `Profile fetch failed: ${perr.message}` }, 500);

    const email = profile?.email ?? user.email ?? undefined;
    let customerId = profile?.stripe_customer_id as string | undefined;

    // Verify customer exists in Stripe (defensive check for test/live mode mismatches)
    if (customerId) {
      try {
        await stripe.customers.retrieve(customerId);
        console.log('Existing customer verified:', customerId);
      } catch (err: any) {
        console.log('Customer verification failed:', err.message, '- creating new customer');
        customerId = undefined; // Force creation of new customer
      }
    }

    if (!customerId) {
      const customer = await stripe.customers.create({ email, metadata: { supabase_user_id: user.id } });
      customerId = customer.id;
      console.log('Created new customer:', customerId);
      const { error: uperr } = await svc.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
      if (uperr) return json(req, { error: `Profile update failed: ${uperr.message}` }, 500);
    }

    // compute origin safely - accept any provided origin/referer (preview or prod)
    let origin = 'https://petlinkid.com';
    const ref = req.headers.get('origin') ?? req.headers.get('referer');
    try { 
      if (ref) origin = new URL(ref).origin;
    } catch {}


    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id, // Critical: link session to user
      allow_promotion_codes: true,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
        metadata: { user_id: user.id }, // Store user_id in subscription metadata
      },
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancel`,
    });

    return json(req, { url: session.url });
  } catch (e: any) {
    console.error('create-checkout error', e);
    return json(req, { error: String(e?.message ?? e) }, 500);
  }
});

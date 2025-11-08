// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@18.5.0';
import { buildCors, json } from '../_shared/cors.ts';
import { makeServiceClient, must } from '../_shared/clients.ts';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: buildCors(req) });

  try {
    const authHeader = req.headers.get('authorization') ?? req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) return json(req, { error: 'Missing Authorization Bearer token' }, 401);

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const svc = makeServiceClient();
    const { data: { user }, error: uerr } = await svc.auth.getUser(token);
    if (uerr || !user) return json(req, { error: 'User not authenticated' }, 401);

    const stripe = new Stripe(must('STRIPE_SECRET_KEY'), { apiVersion: '2025-08-27.basil' });

    // Load profile for existing Stripe IDs / email
    const { data: profile, error: perr } = await svc
      .from('profiles')
      .select('id, email, stripe_customer_id, deletion_scheduled')
      .eq('id', user.id)
      .single();
    if (perr) return json(req, { error: `Profile fetch failed: ${perr.message}` }, 500);
    if (!profile || profile.deletion_scheduled) return json(req, { error: 'Profile not available' }, 400);

    const email = profile.email ?? user.email ?? undefined;
    let customerId = profile.stripe_customer_id as string | undefined;

    // If missing, try to find customer by email
    if (!customerId && email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      if (customers.data.length > 0) customerId = customers.data[0].id;
    }

    if (!customerId) {
      // No customer yet, nothing to sync
      return json(req, { synced: true, status: 'none' });
    }

    // Fetch latest subscription for this customer
    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 1 });
    const sub = subs.data[0];

    if (!sub) {
      // No subscription
      const { error: upErr } = await svc
        .from('profiles')
        .update({
          plan_v2: 'FREE',
          subscription_status: 'none',
          next_billing_at: null,
        })
        .eq('id', user.id);
      if (upErr) console.error('sync-subscription profile update error (no sub):', upErr);
      return json(req, { synced: true, status: 'none' });
    }

    // Determine plan and map
    const status = sub.status; // active | trialing | past_due | canceled | etc.
    let plan_v2 = 'PRO';
    if (status === 'trialing') plan_v2 = 'TRIAL';
    if (status === 'canceled') plan_v2 = 'FREE';

    console.log('[sync-subscription] Syncing subscription:', { 
      subscriptionId: sub.id, 
      status, 
      plan_v2, 
      hasPeriodEnd: !!sub.current_period_end,
      hasTrialEnd: !!sub.trial_end 
    });

    const { error: updateError } = await svc
      .from('profiles')
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
        stripe_status: status,
        stripe_tier: plan_v2.toLowerCase(),
        stripe_current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        plan_v2,
        subscription_status: status,
        next_billing_at: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
        trial_end_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      })
      .eq('id', user.id);

    if (updateError) return json(req, { error: `Profile update failed: ${updateError.message}` }, 500);

    return json(req, { synced: true, status });
  } catch (e: any) {
    console.error('sync-subscription error', e);
    return json(req, { error: String(e?.message ?? e) }, 500);
  }
});

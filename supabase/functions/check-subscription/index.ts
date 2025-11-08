import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header provided" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    logStep("Authorization header found");

    // Create Supabase client with auth header for user context
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    );

    // Create service role client for DB operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
    const stripeAvailable = !!stripeKey;
    if (!stripeAvailable) {
      logStep("Stripe key not set - running in no-Stripe mode");
    }


    logStep("Authenticating user with token");
    const token = authHeader.replace("Bearer ", "");
    let { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !userData?.user) {
      logStep("Primary getUser(token) failed, trying header-bound getUser()", { err: userError?.message });
      ({ data: userData, error: userError } = await supabaseAuth.auth.getUser());
    }
    if (userError || !userData?.user?.email) {
      return new Response(JSON.stringify({ error: userError?.message || "Authentication error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    // First check for manual tier assignment in database
    const { data: manualSub } = await supabaseClient
      .from('user_subscriptions')
      .select('tier_name, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (manualSub) {
      logStep("Found manual subscription in database", { tier: manualSub.tier_name });
      
      // Map tier names to product IDs for consistency
      const tierToProductMap: Record<string, string> = {
        'premium': 'prod_TGGcRtzlK6vz7A',
        'family': 'prod_TGGcY3nKNalPuA',
      };
      
      const productId = tierToProductMap[manualSub.tier_name] || null;
      
      // Persist manual tier on profile for consistency
      await supabaseClient
        .from('profiles')
        .update({
          plan_tier: manualSub.tier_name,
          plan_source: 'manual',
          plan_updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      await supabaseClient.from('plan_audit').insert({
        actor_id: user.id,
        target_id: user.id,
        action: 'MANUAL_SUB_ACTIVE',
        new_tier: manualSub.tier_name,
        note: 'Manual subscription detected',
      });

      return new Response(JSON.stringify({
        subscribed: true,
        product_id: productId,
        subscription_end: null,
        manual: true,
        desired_tier: manualSub.tier_name,
        effective_tier: manualSub.tier_name
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Fallback: check profile plan_tier/premium_tier if set by admin
    const { data: profileTier } = await supabaseClient
      .from('profiles')
      .select('plan_tier')
      .eq('id', user.id)
      .maybeSingle();

    const assignedTier = profileTier?.plan_tier;
    if (assignedTier && assignedTier !== 'free') {
      logStep("Found assigned tier on profile", { tier: assignedTier });
      const tierToProductMap: Record<string, string> = {
        'premium': 'prod_TGGcRtzlK6vz7A',
        'family': 'prod_TGGcY3nKNalPuA',
      };
      const productId = tierToProductMap[assignedTier] || null;
      return new Response(JSON.stringify({
        subscribed: true,
        product_id: productId,
        subscription_end: null,
        manual: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If no manual subscription or profile tier, optionally check Stripe (if configured)
    let hasActiveSub = false;
    let productId: string | null = null;
    let subscriptionEnd: string | null = null;

    if (stripeAvailable) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length === 0) {
        logStep("No customer found, returning unsubscribed state");
      } else {
        const customerId = customers.data[0].id;
        logStep("Found Stripe customer", { customerId });

        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          status: "active",
          limit: 1,
        });
        hasActiveSub = subscriptions.data.length > 0;

        if (hasActiveSub) {
          const subscription = subscriptions.data[0];
          subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
          logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
          productId = subscription.items.data[0].price.product as string;
          logStep("Determined subscription product", { productId });
        } else {
          logStep("No active subscription found");
        }
      }
    } else {
      logStep("Skipping Stripe checks (no key configured)");
    }

    // Map Stripe product to tier
    const PRODUCT_TO_TIER: Record<string, 'premium' | 'family'> = {
      'prod_TGGcRtzlK6vz7A': 'premium',
      'prod_TGGcY3nKNalPuA': 'family',
    };

    let desiredTier: 'free' | 'premium' | 'family' = 'free';
    if (hasActiveSub && productId && PRODUCT_TO_TIER[productId as string]) {
      desiredTier = PRODUCT_TO_TIER[productId as string];
    }

    // Count user's pets
    const { count: petCount } = await supabaseClient
      .from('pets')
      .select('id', { head: true, count: 'exact' })
      .eq('user_id', user.id);

    // Get current profile tier
    const { data: currentProfile } = await supabaseClient
      .from('profiles')
      .select('plan_tier')
      .eq('id', user.id)
      .maybeSingle();

    const currentTier = (currentProfile?.plan_tier as 'free'|'premium'|'family') ?? 'free';
    
    // If Stripe isn't available, return unsubscribed without mutating DB state
    if (!stripeAvailable) {
      logStep("Returning unsubscribed state (no Stripe, no manual tier)");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Enforce downgrade constraints
    const MAX_PETS: Record<'free'|'premium'|'family', number> = { free: 1, premium: 5, family: -1 };
    let enforcement: { blocked: boolean; reason?: string; pet_count?: number; limit?: number } | null = null;
    let effectiveTier: 'free' | 'premium' | 'family' = desiredTier;

    if (desiredTier === 'premium' && typeof petCount === 'number' && petCount > MAX_PETS.premium) {
      enforcement = { blocked: true, reason: 'Too many pets for Premium', pet_count: petCount, limit: MAX_PETS.premium };
      effectiveTier = currentTier === 'family' ? 'family' : 'premium';
    } else if (desiredTier === 'free' && typeof petCount === 'number' && petCount > MAX_PETS.free) {
      enforcement = { blocked: true, reason: 'Too many pets for Free', pet_count: petCount, limit: MAX_PETS.free };
      // Keep the higher of current or 'premium' to avoid locking user out
      effectiveTier = currentTier !== 'free' ? currentTier : 'premium';
    }

    // Persist profile tier
    await supabaseClient
      .from('profiles')
      .update({
        plan_tier: effectiveTier,
        plan_source: 'stripe',
        plan_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    // Upsert subscription record
    const { data: existingSub } = await supabaseClient
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingSub?.id) {
      await supabaseClient
        .from('user_subscriptions')
        .update({
          status: hasActiveSub ? 'active' : 'canceled',
          tier_name: desiredTier,
          current_period_end: subscriptionEnd,
        })
        .eq('id', existingSub.id);
    } else {
      await supabaseClient
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          status: hasActiveSub ? 'active' : 'canceled',
          tier_name: desiredTier,
          current_period_end: subscriptionEnd,
        });
    }

    // Audit
    await supabaseClient.from('plan_audit').insert({
      actor_id: user.id,
      target_id: user.id,
      action: 'AUTO_UPDATE_FROM_STRIPE',
      new_tier: effectiveTier,
      note: enforcement?.reason ?? 'OK',
    });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd,
      desired_tier: desiredTier,
      effective_tier: effectiveTier,
      pet_count: petCount ?? 0,
      enforcement,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  logStep("ERROR in check-subscription", { message: errorMessage });
  return new Response(JSON.stringify({ error: errorMessage }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 500,
  });
}
});

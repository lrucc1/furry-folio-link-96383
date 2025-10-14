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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
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
        'premium': 'prod_TBUW3WogN0dEtQ',
        'family': 'prod_TBUX7Ubgxwr3co',
      };
      
      const productId = tierToProductMap[manualSub.tier_name] || null;
      
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

    // Fallback: check profile plan_tier/premium_tier if set by admin
    const { data: profileTier } = await supabaseClient
      .from('profiles')
      .select('plan_tier, premium_tier')
      .eq('id', user.id)
      .maybeSingle();

    const assignedTier = profileTier?.plan_tier || profileTier?.premium_tier;
    if (assignedTier && assignedTier !== 'free') {
      logStep("Found assigned tier on profile", { tier: assignedTier });
      const tierToProductMap: Record<string, string> = {
        'premium': 'prod_TBUW3WogN0dEtQ',
        'family': 'prod_TBUX7Ubgxwr3co',
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

    // If no manual subscription or profile tier, check Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, returning unsubscribed state");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let productId = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      productId = subscription.items.data[0].price.product;
      logStep("Determined subscription product", { productId });
    } else {
      logStep("No active subscription found");
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd
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

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST,OPTIONS'
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-ACCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify authenticated user with anon key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      logStep("ERROR: User authentication failed", { error: userError });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;
    logStep("User authenticated", { userId, email: userEmail });

    // Create admin client with service role key
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Cancel Stripe subscription and delete customer (Issue 1)
    let stripeCustomerId: string | null = null;
    try {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey && userEmail) {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
        
        if (customers.data.length > 0) {
          stripeCustomerId = customers.data[0].id;
          
          // List and immediately cancel all active subscriptions
          const subscriptions = await stripe.subscriptions.list({ customer: stripeCustomerId });
          for (const subscription of subscriptions.data) {
            if (subscription.status === 'active' || subscription.status === 'trialing') {
              await stripe.subscriptions.cancel(subscription.id);
              logStep("Canceled subscription immediately", { subscriptionId: subscription.id });
            }
          }
          
          // Delete Stripe customer record
          await stripe.customers.del(stripeCustomerId);
          logStep("Deleted Stripe customer", { customerId: stripeCustomerId });
        } else {
          logStep("No Stripe customer found");
        }
      }
    } catch (err) {
      logStep("Warning: Error processing Stripe", { error: err });
      // Continue with soft deletion even if Stripe fails
    }

    // Soft delete: Mark account for deletion (Issue 5)
    const deletionDate = new Date();
    const { error: softDeleteError } = await adminClient
      .from('profiles')
      .update({
        deleted_at: deletionDate.toISOString(),
        deletion_scheduled: true,
      })
      .eq('id', userId);

    if (softDeleteError) {
      logStep("ERROR: Failed to mark account for deletion", { error: softDeleteError });
      return new Response(JSON.stringify({ error: "Failed to schedule account deletion" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Account marked for deletion (30-day grace period)", { 
      deletedAt: deletionDate.toISOString(),
      hardDeleteAfter: new Date(deletionDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    return new Response(JSON.stringify({ status: "deleted" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in delete-account", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

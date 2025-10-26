import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const signature = req.headers.get("stripe-signature");
    
    // CRITICAL: Always require webhook secret and signature
    if (!webhookSecret) {
      logStep("❌ CRITICAL: STRIPE_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!signature) {
      logStep("❌ ERROR: Missing stripe-signature header");
      return new Response(
        JSON.stringify({ error: "Missing signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { eventType: event.type });
    } catch (err: any) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store webhook event for idempotency and audit
    const { data: existingEvent } = await supabaseClient
      .from('stripe_webhook_events')
      .select('id')
      .eq('event_id', event.id)
      .single();

    if (existingEvent) {
      logStep("Webhook already processed", { eventId: event.id });
      return new Response(JSON.stringify({ received: true, already_processed: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert webhook event
    await supabaseClient
      .from('stripe_webhook_events')
      .insert({
        event_id: event.id,
        event_type: event.type,
        payload: event as any,
      });

    // Process event based on type
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription event", { 
          subscriptionId: subscription.id, 
          status: subscription.status 
        });

        // Get customer email
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        if (!customer.email) {
          logStep("No email found for customer", { customerId: subscription.customer });
          break;
        }

        // Find user by email
        const { data: userData } = await supabaseClient.auth.admin.listUsers();
        const user = userData.users.find(u => u.email === customer.email);

        if (!user) {
          logStep("User not found for email", { email: customer.email });
          break;
        }

        // Check if profile exists (Issue 4: Handle deleted users)
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('id, deletion_scheduled')
          .eq('id', user.id)
          .maybeSingle();

        if (!profile) {
          logStep("Profile not found (possibly deleted), skipping webhook", { userId: user.id });
          break;
        }

        if (profile.deletion_scheduled) {
          logStep("Profile scheduled for deletion, skipping webhook", { userId: user.id });
          break;
        }

        // Determine tier from product - map to new plan_v2
        const priceId = subscription.items.data[0]?.price.id;
        const productId = subscription.items.data[0]?.price.product as string;
        
        // Map to new plan_v2: PRO or TRIAL
        let plan_v2 = 'PRO';
        let subscription_status = subscription.status;
        
        // If it's a trialing subscription, set plan to TRIAL
        if (subscription.status === 'trialing') {
          plan_v2 = 'TRIAL';
        }

        // Update profile with subscription data using new plan_v2 fields
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            stripe_customer_id: subscription.customer as string,
            stripe_subscription_id: subscription.id,
            stripe_status: subscription.status,
            stripe_tier: plan_v2.toLowerCase(),
            stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            // New plan_v2 fields
            plan_v2: plan_v2,
            subscription_status: subscription_status,
            next_billing_at: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_end_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            // Keep old fields for backwards compatibility
            plan_tier: plan_v2.toLowerCase(),
          })
          .eq('id', user.id);

        if (updateError) {
          logStep("Error updating profile", { error: updateError });
          throw updateError;
        }

        logStep("Subscription updated successfully", { userId: user.id, plan_v2, status: subscription.status });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription deletion", { subscriptionId: subscription.id });

        // Check if profile exists (Issue 4: Handle deleted users)
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('id, deletion_scheduled')
          .eq('stripe_subscription_id', subscription.id)
          .maybeSingle();

        if (!profile) {
          logStep("Profile not found (possibly deleted), skipping webhook");
          break;
        }

        if (profile.deletion_scheduled) {
          logStep("Profile scheduled for deletion, skipping webhook", { userId: profile.id });
          break;
        }

        // Update profile to free tier using new plan_v2
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            stripe_status: 'canceled',
            stripe_tier: 'free',
            plan_tier: 'free',
            // New plan_v2 fields
            plan_v2: 'FREE',
            subscription_status: 'canceled',
            next_billing_at: null,
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          logStep("Error updating profile on cancellation", { error: updateError });
          throw updateError;
        }

        logStep("Subscription canceled successfully");
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Trial ending soon", { 
          subscriptionId: subscription.id,
          trialEnd: new Date(subscription.trial_end! * 1000).toISOString() 
        });
        // TODO: Send notification to user
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Payment failed", { invoiceId: invoice.id, customerId: invoice.customer });

        // Update profile with failed payment status
        if (invoice.subscription) {
          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({
              stripe_status: 'past_due',
              subscription_status: 'past_due',
              latest_invoice_id: invoice.id,
            })
            .eq('stripe_subscription_id', invoice.subscription as string);

          if (updateError) {
            logStep("Error updating profile on payment failure", { error: updateError });
          }
        }
        // TODO: Send notification to user via email
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    // Mark event as processed
    await supabaseClient
      .from('stripe_webhook_events')
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq('event_id', event.id);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

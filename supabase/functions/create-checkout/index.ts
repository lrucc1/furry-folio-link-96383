import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const ALLOWED_ORIGINS = new Set([
  'https://petlinkid.com',
  'https://www.petlinkid.com',
  'https://petlinkid.lovable.app',
  'https://furry-folio-link-96383.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080'
]);

function isAllowedOrigin(origin: string) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const host = url.hostname;
    if (ALLOWED_ORIGINS.has(origin)) return true;
    if (host.endsWith('.lovable.app')) return true;
    if (host.endsWith('.lovableproject.com')) return true;
    return false;
  } catch {
    return false;
  }
}

function cors(origin: string) {
  const allowed = isAllowedOrigin(origin);
  return {
    allowed,
    headers: {
      'Access-Control-Allow-Origin': allowed ? origin : 'https://petlinkid.com',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    }
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  const c = cors(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: c.headers });
  }
  
  if (!c.allowed) {
    return new Response('Forbidden', { status: 403, headers: c.headers });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    console.log('[CREATE-CHECKOUT] User:', user?.id, user?.email);
    
    if (!user?.email) {
      console.error('[CREATE-CHECKOUT] Auth error:', authError);
      throw new Error("User not authenticated or email not available");
    }

    const body = await req.json().catch(() => ({}));
    let priceId: string | undefined = body?.priceId;
    const tier = body?.tier;
    const billingPeriod = body?.billingPeriod || 'monthly';
    const withTrial = body?.withTrial === true;
    
    console.log('[CREATE-CHECKOUT] Request:', { tier, billingPeriod, withTrial, priceId });

    // PRO tier price IDs - these are the hardcoded Stripe price IDs for your PRO plan
    const PRO_PRICE_MONTHLY = 'price_1SMaydEhyEZfSSpNTP4b7ISS'; // Pro monthly A$2.99
    const PRO_PRICE_YEARLY = 'price_1SPU5YEhyEZfSSpN3vGN7WGC';  // Pro yearly A$28.99

    // If priceId not provided, determine from tier and billing period
    if (!priceId && tier === 'PRO') {
      priceId = billingPeriod === 'yearly' ? PRO_PRICE_YEARLY : PRO_PRICE_MONTHLY;
    }

    if (!priceId) throw new Error("Price ID is required");


    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2024-06-20" 
    });

    // Always check/create customer with metadata
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('[CREATE-CHECKOUT] Found existing customer:', customerId);
      
      // Update metadata to ensure user_id is set
      await stripe.customers.update(customerId, {
        metadata: { user_id: user.id }
      });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
      console.log('[CREATE-CHECKOUT] Created new customer:', customerId);
    }

    // Build session config
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      client_reference_id: user.id,
      metadata: { user_id: user.id },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/account?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
      subscription_data: {
        description: 'Full features for pet families',
        metadata: {
          plan: 'Pro',
          user_id: user.id,
          features: 'Unlimited Pet Profiles, Full Caregiver Access (read & write), Unlimited Health Reminders, 200MB Document Storage, Data Export Capability, Priority Support'
        }
      }
    };

    // Add 7-day trial if requested
    if (withTrial) {
      sessionConfig.subscription_data.trial_period_days = 7;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    console.log('[CREATE-CHECKOUT] Session created:', session.id, '→', session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...c.headers, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...c.headers, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

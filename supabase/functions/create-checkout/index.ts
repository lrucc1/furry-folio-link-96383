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
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { priceId } = await req.json();
    if (!priceId) throw new Error("Price ID is required");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2024-06-20" 
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/account?success=true`,
      cancel_url: `${origin}/pricing?canceled=true`,
    });

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

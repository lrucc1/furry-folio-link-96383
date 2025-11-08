import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    // Check if user already has a plan or has used trial before
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('plan_v2, subscription_status, trial_end_at')
      .eq('id', user.id)
      .single();

    if (profileError) throw new Error("Failed to fetch user profile");

    // Check if user already has PRO or active subscription
    if (profile.plan_v2 === 'PRO' || profile.subscription_status === 'active') {
      return new Response(
        JSON.stringify({ error: "You already have a Pro plan" }), 
        { headers: { ...c.headers, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Check if trial was already used (trial_end_at exists in the past)
    if (profile.trial_end_at) {
      const trialEnd = new Date(profile.trial_end_at);
      if (trialEnd < new Date()) {
        return new Response(
          JSON.stringify({ error: "You have already used your free trial" }), 
          { headers: { ...c.headers, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }

    // Start the trial - 7 days from now
    const trialEndAt = new Date();
    trialEndAt.setDate(trialEndAt.getDate() + 7);

    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        plan_v2: 'PRO',
        subscription_status: 'trialing',
        trial_end_at: trialEndAt.toISOString(),
      })
      .eq('id', user.id);

    if (updateError) throw new Error("Failed to activate trial");

    return new Response(
      JSON.stringify({ 
        success: true, 
        trial_end_at: trialEndAt.toISOString(),
        message: "7-day free trial activated!" 
      }),
      { headers: { ...c.headers, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error('Error starting trial:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...c.headers, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

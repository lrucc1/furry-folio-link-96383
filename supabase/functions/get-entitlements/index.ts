import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCors, isAllowedOrigin } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = buildCors(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate origin
  const origin = req.headers.get('origin') ?? '';
  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: corsHeaders }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    // Fetch user's plan from profiles table
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("plan_tier, plan_expires_at")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return new Response(
        JSON.stringify({ 
          plan: "free",
          status: "active",
          renewal_at: null 
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    const plan = profile?.plan_tier || "free";
    const expiresAt = profile?.plan_expires_at;
    const now = new Date();
    const isExpired = expiresAt ? new Date(expiresAt) < now : false;
    const effectivePlan = isExpired ? "free" : plan;

    return new Response(
      JSON.stringify({
        plan: effectivePlan,
        status: isExpired ? "expired" : "active",
        renewal_at: expiresAt
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    const corsHeaders = buildCors(req);
    console.error("Entitlements error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        plan: "free",
        status: "active",
        renewal_at: null
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});

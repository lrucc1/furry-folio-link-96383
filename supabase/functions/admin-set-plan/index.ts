import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const ALLOWED_ORIGINS = new Set([
  'https://petlinkid.com',
  'https://www.petlinkid.com',
  'https://petlinkid.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080'
]);

const corsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://petlinkid.lovable.app';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADMIN-SET-PLAN] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders(origin) 
    });
  }

  try {
    logStep("Function started");

    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify requester is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const requester = userData.user;
    if (!requester?.id) throw new Error("User not authenticated");
    logStep("Requester authenticated", { userId: requester.id });

    // Check if requester is admin
    const { data: requesterProfile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', requester.id)
      .single();

    const isAdmin = requesterProfile?.role === 'super_admin' || requesterProfile?.role === 'system_admin';
    if (!isAdmin) {
      logStep("Permission denied - not admin", { role: requesterProfile?.role });
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
      });
    }

    logStep("Admin verified", { role: requesterProfile.role });

    // Parse request body
    const body = await req.json();
    const { target_user_id, new_tier, expires_at, note } = body;

    if (!target_user_id || !new_tier) {
      throw new Error("Missing required fields: target_user_id, new_tier");
    }

    if (!['free', 'premium'].includes(new_tier)) {
      throw new Error("Invalid tier: must be 'free' or 'premium'");
    }

    logStep("Updating target user plan", { target_user_id, new_tier });

    // Update target user's profile
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        plan_tier: new_tier,
        plan_source: 'manual',
        manual_override: true,
        plan_expires_at: expires_at || null,
        plan_updated_at: new Date().toISOString(),
        plan_notes: note || null,
      })
      .eq('id', target_user_id);

    if (updateError) {
      logStep("Error updating profile", { error: updateError });
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    logStep("Profile updated successfully");

    // Insert audit entry
    const { error: auditError } = await supabaseAdmin
      .from('plan_audit')
      .insert({
        actor_id: requester.id,
        target_id: target_user_id,
        action: 'set_plan',
        new_tier,
        note: note || null,
      });

    if (auditError) {
      logStep("Warning: audit entry failed", { error: auditError });
      // Don't fail the request if audit fails
    } else {
      logStep("Audit entry created");
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    });
  }
});

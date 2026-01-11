import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCors, isAllowedOrigin } from "../_shared/cors.ts";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELETE-ACCOUNT] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsHeaders = buildCors(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Validate origin
  const origin = req.headers.get('origin') ?? '';
  if (!isAllowedOrigin(origin)) {
    logStep("ERROR: Forbidden origin", { origin });
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
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
        headers: corsHeaders,
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

    // Note: Apple IAP subscriptions are managed by Apple. 
    // Users should cancel their subscription via iOS Settings before deleting account.
    // The subscription will remain active until the billing period ends.
    logStep("Note: Any Apple IAP subscription should be canceled via iOS Settings");

    // Soft delete: Mark account for deletion
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
        headers: corsHeaders,
      });
    }

    logStep("Account marked for deletion (30-day grace period)", { 
      deletedAt: deletionDate.toISOString(),
      hardDeleteAfter: new Date(deletionDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    return new Response(JSON.stringify({ status: "deleted" }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in delete-account", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

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
    logStep("User authenticated", { userId });

    // Create admin client with service role key
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Delete user data from tables (wrapped in try/catch for missing tables)
    const tables = ['pets', 'health_reminders', 'pet_documents', 'vaccinations', 'notifications', 'family_members'];
    
    for (const table of tables) {
      try {
        const { error } = await adminClient.from(table).delete().eq('user_id', userId);
        if (error) {
          logStep(`Warning: Error deleting from ${table}`, { error: error.message });
        } else {
          logStep(`Deleted data from ${table}`);
        }
      } catch (err) {
        logStep(`Warning: Table ${table} may not exist`, { error: err });
      }
    }

    // Delete user profile
    try {
      await adminClient.from('profiles').delete().eq('id', userId);
      logStep("Deleted profile");
    } catch (err) {
      logStep("Warning: Error deleting profile", { error: err });
    }

    // Delete Stripe customer if exists
    try {
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (stripeKey && userData.user.email) {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
        const customers = await stripe.customers.list({ email: userData.user.email, limit: 1 });
        
        if (customers.data.length > 0) {
          const customerId = customers.data[0].id;
          await stripe.customers.del(customerId);
          logStep("Deleted Stripe customer", { customerId });
        } else {
          logStep("No Stripe customer found to delete");
        }
      }
    } catch (err) {
      logStep("Warning: Error deleting Stripe customer", { error: err });
    }

    // Delete user from auth
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      logStep("ERROR: Failed to delete user", { error: deleteError });
      return new Response(JSON.stringify({ error: "Failed to delete account" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Account deleted successfully");

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

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { requireCronSecret } from "../_shared/cron.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CLEANUP-DELETED] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const cronError = requireCronSecret(req);
    if (cronError) {
      return cronError;
    }

    logStep("Cleanup function started");

    // Create admin client
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find profiles marked for deletion over 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: profilesToDelete, error: fetchError } = await adminClient
      .from('profiles')
      .select('id, email, deleted_at')
      .eq('deletion_scheduled', true)
      .lt('deleted_at', thirtyDaysAgo.toISOString());

    if (fetchError) {
      logStep("ERROR: Failed to fetch profiles", { error: fetchError });
      throw fetchError;
    }

    if (!profilesToDelete || profilesToDelete.length === 0) {
      logStep("No profiles to delete");
      return new Response(JSON.stringify({ deleted: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Found profiles to delete", { count: profilesToDelete.length });

    const deletedCount = [];
    const tables = ['pets', 'health_reminders', 'pet_documents', 'vaccinations', 'notifications', 'family_members', 'pet_memberships', 'pet_invites'];

    for (const profile of profilesToDelete) {
      const userId = profile.id;
      logStep("Deleting user data", { userId });

      try {
        // Delete from all related tables
        for (const table of tables) {
          try {
            await adminClient.from(table).delete().eq('user_id', userId);
            logStep(`Deleted ${table} data for user`, { userId });
          } catch (err) {
            logStep(`Warning: Error deleting from ${table}`, { userId, error: err });
          }
        }

        // Delete profile
        await adminClient.from('profiles').delete().eq('id', userId);
        logStep("Deleted profile", { userId });

        // Delete auth user
        const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId);
        if (authDeleteError) {
          logStep("ERROR: Failed to delete auth user", { userId, error: authDeleteError });
        } else {
          logStep("Deleted auth user", { userId });
          deletedCount.push(userId);
        }
      } catch (err) {
        logStep("ERROR: Failed to delete user", { userId, error: err });
      }
    }

    logStep("Cleanup complete", { deletedCount: deletedCount.length });

    return new Response(JSON.stringify({ deleted: deletedCount.length, userIds: deletedCount }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cleanup-deleted-accounts", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

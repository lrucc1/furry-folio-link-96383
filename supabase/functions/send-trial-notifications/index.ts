import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { requireCronSecret } from "../_shared/cron.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-TRIAL-NOTIFICATIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cronError = requireCronSecret(req);
    if (cronError) {
      return cronError;
    }

    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Find users whose trial ends tomorrow (day 6 notification)
    const { data: usersEndingTrial, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, trial_end_at')
      .eq('plan_v2', 'TRIAL')
      .gte('trial_end_at', now.toISOString())
      .lt('trial_end_at', tomorrow.toISOString());

    if (fetchError) {
      logStep("Error fetching users", { error: fetchError });
      throw fetchError;
    }

    logStep(`Found ${usersEndingTrial?.length || 0} users with trial ending tomorrow`);

    // Send notifications for each user
    for (const user of usersEndingTrial || []) {
      // Create in-app notification
      const { error: notifError } = await supabaseClient
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'warning',
          title: 'Your Pro trial ends tomorrow',
          message: 'Your 7-day Pro trial ends tomorrow. Upgrade to keep unlimited pets, reminders, and full features.',
        });

      if (notifError) {
        logStep("Error creating notification", { error: notifError });
      } else {
        logStep("Notification created");
      }
    }

    // Find users whose trial has just expired (within last hour)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const { data: expiredTrials, error: expiredError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, trial_end_at')
      .eq('plan_v2', 'TRIAL')
      .lt('trial_end_at', now.toISOString())
      .gte('trial_end_at', oneHourAgo.toISOString());

    if (!expiredError && expiredTrials && expiredTrials.length > 0) {
      logStep(`Found ${expiredTrials.length} just-expired trials to process`);

      for (const user of expiredTrials) {
        // Downgrade to FREE
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            plan_v2: 'FREE',
            subscription_status: 'none',
            trial_end_at: null,
          })
          .eq('id', user.id);

        if (updateError) {
          logStep("Error downgrading user", { error: updateError });
        } else {
          logStep("User downgraded to FREE");

          // Send downgrade notification
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: user.id,
              type: 'info',
              title: 'Trial ended - Welcome to Free plan',
              message: 'Your Pro trial has ended. You can still use PetLinkID with 1 pet, 2 reminders, and basic features. Upgrade anytime!',
            });

          logStep("Trial ended notification sent");
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        trialEndingSoon: usersEndingTrial?.length || 0,
        trialsExpired: expiredTrials?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-trial-notifications", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

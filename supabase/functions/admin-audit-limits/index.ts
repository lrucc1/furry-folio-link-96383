import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserAudit {
  user_id: string;
  email: string;
  plan: string;
  pets_count: number;
  pets_limit: number;
  reminders_count: number;
  reminders_limit: number;
  storage_mb: number;
  storage_limit: number;
  caregivers_count: number;
  caregivers_limit: number;
  violations: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (!roles?.some(r => r.role === 'admin')) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all FREE users
    const { data: profiles } = await supabaseClient
      .from('profiles')
      .select('id, email, plan_v2, subscription_status')
      .or('plan_v2.is.null,plan_v2.eq.FREE');

    if (!profiles) {
      return new Response(JSON.stringify({ users: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const audits: UserAudit[] = [];

    for (const profile of profiles) {
      const userId = profile.id;

      // Count pets
      const { count: petsCount } = await supabaseClient
        .from('pets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Count active reminders (health + vaccinations with recurrence or future dates)
      const { data: healthReminders } = await supabaseClient
        .from('health_reminders')
        .select('id, completed, reminder_date, recurrence_enabled')
        .eq('user_id', userId);

      const { data: vaccinations } = await supabaseClient
        .from('vaccinations')
        .select('id, next_due_date, recurrence_enabled')
        .eq('user_id', userId);

      const activeHealthReminders = healthReminders?.filter(r => 
        !r.completed && (r.recurrence_enabled || new Date(r.reminder_date) >= new Date())
      ).length || 0;

      const activeVaccinations = vaccinations?.filter(v => 
        v.recurrence_enabled || (v.next_due_date && new Date(v.next_due_date) >= new Date())
      ).length || 0;

      const totalActiveReminders = activeHealthReminders + activeVaccinations;

      // Get storage usage
      const { data: storageData } = await supabaseClient
        .from('storage_usage')
        .select('total_bytes')
        .eq('user_id', userId)
        .single();

      const storageMb = storageData ? (storageData.total_bytes / 1024 / 1024) : 0;

      // Count caregivers (read-write pet memberships)
      const { count: caregiversCount } = await supabaseClient
        .from('pet_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('role', 'family');

      // FREE limits
      const petsLimit = 1;
      const remindersLimit = 2;
      const storageLimit = 50;
      const caregiversLimit = 1;

      const violations: string[] = [];
      if ((petsCount || 0) > petsLimit) {
        violations.push(`Pets: ${petsCount}/${petsLimit}`);
      }
      if (totalActiveReminders > remindersLimit) {
        violations.push(`Reminders: ${totalActiveReminders}/${remindersLimit}`);
      }
      if (storageMb > storageLimit) {
        violations.push(`Storage: ${storageMb.toFixed(1)}MB/${storageLimit}MB`);
      }
      if ((caregiversCount || 0) > caregiversLimit) {
        violations.push(`Caregivers: ${caregiversCount}/${caregiversLimit}`);
      }

      // Only include users with violations
      if (violations.length > 0) {
        audits.push({
          user_id: userId,
          email: profile.email || 'No email',
          plan: profile.plan_v2 || 'FREE',
          pets_count: petsCount || 0,
          pets_limit: petsLimit,
          reminders_count: totalActiveReminders,
          reminders_limit: remindersLimit,
          storage_mb: parseFloat(storageMb.toFixed(2)),
          storage_limit: storageLimit,
          caregivers_count: caregiversCount || 0,
          caregivers_limit: caregiversLimit,
          violations,
        });
      }
    }

    return new Response(JSON.stringify({ users: audits }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-audit-limits:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

type PlanType = "FREE" | "PRO";

type PlanEntitlements = {
  pets_max: number | null;
  caregivers_readonly_max: number;
  caregivers_readwrite_enabled: boolean;
  reminders_active_max: number | null;
  docs_storage_mb: number;
  export_enabled: boolean;
  priority_support: boolean;
};

type UsageSnapshot = {
  pets_count: number;
  caregivers_count: number;
  reminders_active_count: number;
  storage_used_mb: number;
};

type EntitlementCheckResult = {
  allowed: boolean;
  reason?: string;
  upgrade_required?: boolean;
  limit?: number | null;
  current_usage?: number;
  feature?: string;
  plan: PlanType;
  usage: UsageSnapshot;
};

type RequestPayload = {
  feature?: keyof PlanEntitlements | "pets_max" | "reminders_active_max" | "docs_storage_mb" | string;
  incrementBy?: number;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

const FREE_PETS_MAX = Number(Deno.env.get("FREE_PLAN_PETS_MAX") ?? Deno.env.get("FREE_PETS_MAX") ?? "1");
const FREE_REMINDERS_MAX = Number(Deno.env.get("FREE_PLAN_REMINDERS_MAX") ?? Deno.env.get("FREE_REMINDERS_MAX") ?? "2");
const FREE_DOCS_STORAGE_MB = Number(Deno.env.get("FREE_DOCS_STORAGE_MB") ?? "50");
const PRO_DOCS_STORAGE_MB = Number(Deno.env.get("PRO_DOCS_STORAGE_MB") ?? "200");
const FREE_CAREGIVERS_READONLY_MAX = Number(Deno.env.get("FREE_CAREGIVERS_READONLY_MAX") ?? "1");
const PRO_CAREGIVERS_READONLY_MAX = Number(Deno.env.get("PRO_CAREGIVERS_READONLY_MAX") ?? "5");

const PLAN_ENTITLEMENTS: Record<PlanType, PlanEntitlements> = {
  FREE: {
    pets_max: Number.isFinite(FREE_PETS_MAX) ? FREE_PETS_MAX : 1,
    caregivers_readonly_max: Number.isFinite(FREE_CAREGIVERS_READONLY_MAX) ? FREE_CAREGIVERS_READONLY_MAX : 1,
    caregivers_readwrite_enabled: false,
    reminders_active_max: Number.isFinite(FREE_REMINDERS_MAX) ? FREE_REMINDERS_MAX : 2,
    docs_storage_mb: Number.isFinite(FREE_DOCS_STORAGE_MB) ? FREE_DOCS_STORAGE_MB : 50,
    export_enabled: false,
    priority_support: false,
  },
  PRO: {
    pets_max: null,
    caregivers_readonly_max: Number.isFinite(PRO_CAREGIVERS_READONLY_MAX) ? PRO_CAREGIVERS_READONLY_MAX : 5,
    caregivers_readwrite_enabled: true,
    reminders_active_max: null,
    docs_storage_mb: Number.isFinite(PRO_DOCS_STORAGE_MB) ? PRO_DOCS_STORAGE_MB : 200,
    export_enabled: true,
    priority_support: true,
  },
};

function normalizePlan(plan: string | null | undefined): PlanType {
  if (!plan) return "FREE";

  const upper = plan.toUpperCase();
  if (upper === "PRO") return "PRO";
  if (upper === "PREMIUM" || upper === "TRIAL" || upper === "FAMILY") {
    return "PRO";
  }
  return "FREE";
}

async function getUsage(supabaseClient: any, userId: string): Promise<UsageSnapshot> {
  const usage: UsageSnapshot = {
    pets_count: 0,
    caregivers_count: 0,
    reminders_active_count: 0,
    storage_used_mb: 0,
  };

  const { count: petsCount, error: petsError } = await supabaseClient
    .from("pets")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", userId);
  if (petsError) {
    console.error("[entitlement-check] Failed to count pets", petsError);
  }
  usage.pets_count = petsCount ?? 0;

  const { data: petRows, error: petRowsError } = await supabaseClient
    .from("pets")
    .select("id")
    .eq("user_id", userId);
  if (petRowsError) {
    console.error("[entitlement-check] Failed to load pet ids", petRowsError);
  }

  const petIds = petRows?.map((row: { id: string }) => row.id) ?? [];
  if (petIds.length > 0) {
    const { count: caregiversCount, error: caregiversError } = await supabaseClient
      .from("pet_memberships")
      .select("id", { head: true, count: "exact" })
      .in("pet_id", petIds);
    if (caregiversError) {
      console.error("[entitlement-check] Failed to count caregivers", caregiversError);
    }
    usage.caregivers_count = caregiversCount ?? 0;
  }

  const { count: remindersCount, error: remindersError } = await supabaseClient
    .from("health_reminders")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", userId)
    .eq("completed", false);
  if (remindersError) {
    console.error("[entitlement-check] Failed to count reminders", remindersError);
  }
  usage.reminders_active_count = remindersCount ?? 0;

  const { data: storageData, error: storageError } = await supabaseClient
    .from("storage_usage")
    .select("total_bytes")
    .eq("user_id", userId)
    .maybeSingle();
  if (storageError) {
    console.error("[entitlement-check] Failed to fetch storage usage", storageError);
  }

  if (storageData && typeof storageData === 'object' && 'total_bytes' in storageData) {
    usage.storage_used_mb = (storageData as any).total_bytes / (1024 * 1024);
  }

  return usage;
}

function evaluateEntitlement(
  feature: string,
  incrementBy: number,
  entitlements: PlanEntitlements,
  usage: UsageSnapshot,
  plan: PlanType,
): EntitlementCheckResult {
  const safeIncrement = Number.isFinite(incrementBy) ? incrementBy : 0;

  switch (feature) {
    case "pets_max": {
      const limit = entitlements.pets_max;
      if (limit === null) {
        return { allowed: true, plan, usage, feature, limit };
      }

      const projected = usage.pets_count + safeIncrement;
      if (projected > limit) {
        return {
          allowed: false,
          reason: `Free plan allows maximum ${limit} pet${limit === 1 ? "" : "s"}. Upgrade to Pro for unlimited pets.`,
          upgrade_required: true,
          limit,
          current_usage: usage.pets_count,
          plan,
          usage,
          feature,
        };
      }

      return { allowed: true, plan, usage, feature, limit };
    }
    case "reminders_active_max": {
      const limit = entitlements.reminders_active_max;
      if (limit === null) {
        return { allowed: true, plan, usage, feature, limit };
      }

      const projected = usage.reminders_active_count + safeIncrement;
      if (projected > limit) {
        return {
          allowed: false,
          reason: `Free plan allows maximum ${limit} active reminders. Upgrade to Pro for unlimited reminders.`,
          upgrade_required: true,
          limit,
          current_usage: usage.reminders_active_count,
          plan,
          usage,
          feature,
        };
      }

      return { allowed: true, plan, usage, feature, limit };
    }
    case "docs_storage_mb": {
      const limit = entitlements.docs_storage_mb;
      const projected = usage.storage_used_mb + safeIncrement / (1024 * 1024);

      if (projected > limit) {
        return {
          allowed: false,
          reason: `Storage limit exceeded. Free plan allows ${limit}MB. Upgrade to Pro for ${PLAN_ENTITLEMENTS.PRO.docs_storage_mb}MB.`,
          upgrade_required: true,
          limit,
          current_usage: Number(usage.storage_used_mb.toFixed(2)),
          plan,
          usage,
          feature,
        };
      }

      return { allowed: true, plan, usage, feature, limit };
    }
    case "export_enabled": {
      if (!entitlements.export_enabled) {
        return {
          allowed: false,
          reason: "Data export is a Pro feature. Upgrade to export your pet data.",
          upgrade_required: true,
          plan,
          usage,
          feature,
        };
      }
      return { allowed: true, plan, usage, feature };
    }
    case "caregivers_readwrite_enabled": {
      if (!entitlements.caregivers_readwrite_enabled) {
        return {
          allowed: false,
          reason: "Read/write caregiver access is a Pro feature. Free plan allows view-only access.",
          upgrade_required: true,
          plan,
          usage,
          feature,
        };
      }
      return { allowed: true, plan, usage, feature };
    }
    default:
      return { allowed: true, plan, usage, feature };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      },
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let payload: RequestPayload = {};
    if (req.method === "POST") {
      const contentType = req.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        payload = await req.json();
      }
    }

    const incrementByRaw = payload.incrementBy;
    const incrementBy = typeof incrementByRaw === "number" ? incrementByRaw : Number(incrementByRaw ?? 0);
    const requestedFeature = payload.feature ?? "pets_max";

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("plan_v2, plan_tier, trial_end_at")
      .eq("id", user.id)
      .maybeSingle();

    let plan = normalizePlan(profile?.plan_v2 ?? profile?.plan_tier ?? "FREE");

    if (plan === "FREE" && profile?.trial_end_at) {
      const trialEnd = new Date(profile.trial_end_at);
      if (trialEnd > new Date()) {
        plan = "PRO";
      }
    }

    const usage = await getUsage(supabaseClient, user.id);
    const entitlements = PLAN_ENTITLEMENTS[plan];
    const result = evaluateEntitlement(requestedFeature, incrementBy, entitlements, usage, plan);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[entitlement-check] Unexpected error", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        allowed: false,
        upgrade_required: false,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

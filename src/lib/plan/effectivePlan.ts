export type Tier = 'free' | 'pro';
export type LegacyTier = Tier | 'premium' | 'family' | 'trial' | 'fire';
export type PlanSource = 'manual' | 'stripe' | 'system';

export interface ProfilePlanData {
  // Legacy fields
  plan_tier?: LegacyTier;
  manual_override?: boolean;
  stripe_tier?: LegacyTier | null;
  stripe_status?: string | null;
  stripe_current_period_end?: string | null;
  stripe_customer_id?: string | null;
  plan_source?: PlanSource;
  // New v2 fields
  plan_v2?: 'FREE' | 'PRO' | 'TRIAL' | null;
  subscription_status?: 'active' | 'trialing' | 'canceled' | 'past_due' | 'none' | null;
}

function normalizeTier(tier?: LegacyTier | string | null): Tier {
  const value = (tier || 'free').toString().toLowerCase();

  switch (value) {
    case 'pro':
    case 'family':
    case 'premium':
    case 'trial':
    case 'fire':
      return 'pro';
    case 'free':
    default:
      if (value !== 'free' && value) {
        console.warn(`[Plan] Unknown tier "${tier}" detected. Defaulting to free.`);
      }
      return 'free';
  }
}

export function computeEffectiveTier(profile: ProfilePlanData | null): Tier {
  // Prefer new plan_v2 + subscription_status when available
  const v2 = profile?.plan_v2 || null;
  const status = (profile?.subscription_status || profile?.stripe_status) || null;
  if (v2) {
    if (v2 === 'PRO') return 'pro';
    if (v2 === 'TRIAL') return 'pro';
    // FREE or unknown
    return 'free';
  }

  // If an admin override exists, it wins
  if (profile?.manual_override && profile?.plan_tier) {
    return normalizeTier(profile.plan_tier);
  }

  // Check Stripe-derived legacy fields
  if (profile?.stripe_tier && (status === 'active' || status === 'trialing')) {
    return normalizeTier(profile.stripe_tier);
  }

  // Fallback to legacy plan_tier
  if (profile?.plan_tier) {
    return normalizeTier(profile.plan_tier);
  }

  // Default to free
  return 'free';
}

export { normalizeTier };

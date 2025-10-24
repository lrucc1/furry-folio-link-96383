export type Tier = 'free' | 'pro';
export type LegacyTier = Tier | 'premium' | 'family' | 'trial' | 'fire';
export type PlanSource = 'manual' | 'stripe' | 'system';

export interface ProfilePlanData {
  plan_tier?: LegacyTier;
  manual_override?: boolean;
  stripe_tier?: LegacyTier | null;
  stripe_status?: string | null;
  stripe_current_period_end?: string | null;
  stripe_customer_id?: string | null;
  plan_source?: PlanSource;
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
  // If an admin override exists, it wins
  if (profile?.manual_override && profile?.plan_tier) {
    return normalizeTier(profile.plan_tier);
  }

  // Check if there's a Stripe-derived tier with active/trialing status
  if (profile?.stripe_tier && (profile.stripe_status === 'active' || profile.stripe_status === 'trialing')) {
    return normalizeTier(profile.stripe_tier);
  }

  // Database plan_tier
  if (profile?.plan_tier) {
    return normalizeTier(profile.plan_tier);
  }

  // Default to free
  return 'free';
}

export { normalizeTier };

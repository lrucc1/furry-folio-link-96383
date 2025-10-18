export type Tier = 'free' | 'premium' | 'family';
export type PlanSource = 'manual' | 'stripe' | 'system';

export interface ProfilePlanData {
  plan_tier?: Tier;
  manual_override?: boolean;
  stripe_tier?: Tier | null;
  stripe_status?: string | null;
  plan_source?: PlanSource;
}

export function computeEffectiveTier(profile: ProfilePlanData | null): Tier {
  // If an admin override exists, it wins
  if (profile?.manual_override && profile?.plan_tier) {
    return profile.plan_tier;
  }

  // Check if there's a Stripe-derived tier with active/trialing status
  if (profile?.stripe_tier && (profile.stripe_status === 'active' || profile.stripe_status === 'trialing')) {
    return profile.stripe_tier;
  }

  // Database plan_tier
  if (profile?.plan_tier) {
    if (profile.plan_tier === 'family') return 'family';
    if (profile.plan_tier === 'premium') return 'premium';
  }

  // Default to free
  return 'free';
}

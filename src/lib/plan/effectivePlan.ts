export type Tier = 'free' | 'premium';
export type PlanSource = 'manual' | 'stripe' | 'system';

export interface ProfilePlanData {
  plan_tier?: Tier;
  manual_override?: boolean;
  stripe_tier?: Tier | null;
  stripe_status?: string | null;
  premium_tier?: 'free' | 'premium' | 'family';
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

  // Check legacy premium_tier field
  if (profile?.premium_tier && profile.premium_tier !== 'free') {
    return 'premium';
  }

  // Default to free
  return 'free';
}

import type { Tier } from '@/lib/plan/effectivePlan';

export type FeatureKey =
  | 'maxPets'
  | 'smartTags'
  | 'reminders'
  | 'lostMode'
  | 'dataExport'
  | 'prioritySupport';

export const TierFeatures: Record<Tier, Record<FeatureKey, boolean | number>> = {
  free: {
    maxPets: 1,
    smartTags: false,
    reminders: true,
    lostMode: false,
    dataExport: false,
    prioritySupport: false
  },
  premium: {
    maxPets: 5,
    smartTags: true,
    reminders: true,
    lostMode: true,
    dataExport: true,
    prioritySupport: true
  }
};

export function getFeatureValue(tier: Tier, feature: FeatureKey): boolean | number {
  return TierFeatures[tier][feature];
}

export function hasFeature(tier: Tier, feature: FeatureKey): boolean {
  const value = TierFeatures[tier][feature];
  return typeof value === 'boolean' ? value : value > 0;
}

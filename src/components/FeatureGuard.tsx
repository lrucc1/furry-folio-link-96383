import { ReactNode } from 'react';
import { TierFeatures, FeatureKey } from '@/config/tierFeatures';
import { useEffectivePlan } from '@/hooks/useEffectivePlan';
import { UpgradeInline } from '@/components/UpgradeInline';

interface FeatureGuardProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGuard({ feature, children, fallback }: FeatureGuardProps) {
  const { tier, loading } = useEffectivePlan();

  if (loading) {
    return null;
  }

  const featureValue = TierFeatures[tier][feature];
  const allowed = typeof featureValue === 'boolean' ? featureValue : featureValue > 0;

  if (!allowed) {
    return fallback || <UpgradeInline feature={feature} />;
  }

  return <>{children}</>;
}

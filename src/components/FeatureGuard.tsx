import { ReactNode } from 'react';
import { TierFeatures, FeatureKey } from '@/config/tierFeatures';
import { useEffectivePlan } from '@/hooks/useEffectivePlan';
import { UpgradeInline } from '@/components/UpgradeInline';
import { FeaturePreview } from '@/components/FeaturePreview';

interface FeatureGuardProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
}

const previewFeatures: FeatureKey[] = ['documents', 'smartTags', 'dataExport', 'lostMode'];

export function FeatureGuard({ feature, children, fallback }: FeatureGuardProps) {
  const { tier, loading } = useEffectivePlan();

  if (loading) {
    return null;
  }

  const featureValue = TierFeatures[tier][feature];
  const allowed = typeof featureValue === 'boolean' ? featureValue : featureValue > 0;

  if (!allowed) {
    // Use FeaturePreview for specific features, otherwise use fallback or UpgradeInline
    if (previewFeatures.includes(feature)) {
      return <FeaturePreview feature={feature as any} />;
    }
    return fallback || <UpgradeInline feature={feature} />;
  }

  return <>{children}</>;
}

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EntitlementServiceV2 } from '@/services/EntitlementServiceV2';
import type { PlanEntitlements } from '@/config/pricing';

interface EntitlementCheckResult {
  canCreate: boolean;
  message: string | null;
  currentUsage?: number;
  limit?: number | null;
}

export function useEntitlementCheck(
  feature: keyof PlanEntitlements
): EntitlementCheckResult {
  const { user } = useAuth();
  const [result, setResult] = useState<EntitlementCheckResult>({
    canCreate: true,
    message: null,
  });

  useEffect(() => {
    if (!user) {
      setResult({ canCreate: false, message: 'Please sign in to continue' });
      return;
    }

    const checkEntitlement = async () => {
      try {
        const service = EntitlementServiceV2.getInstance();
        const check = await service.checkEntitlement(user.id, feature, 1);

        if (!check.allowed) {
          setResult({
            canCreate: false,
            message: check.reason || 'Limit reached. Upgrade to Pro for unlimited access.',
          });
        } else {
          setResult({
            canCreate: true,
            message: null,
          });
        }
      } catch (error) {
        console.error('Error checking entitlement:', error);
        // On error, allow the action but log it
        setResult({
          canCreate: true,
          message: null,
        });
      }
    };

    checkEntitlement();
  }, [user, feature]);

  return result;
}


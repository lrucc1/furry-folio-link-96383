import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EntitlementService, Entitlement } from '@/services/EntitlementService';
import { ENV_CONFIG } from '@/config/environment';

export function useEntitlement() {
  const { user } = useAuth();
  const [entitlement, setEntitlement] = useState<Entitlement>({
    plan: 'free',
    status: 'active',
    renewal_at: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntitlement({ plan: 'free', status: 'active', renewal_at: null });
      setLoading(false);
      return;
    }

    const service = EntitlementService.getInstance();
    
    const fetchEntitlements = async () => {
      setLoading(true);
      const result = await service.fetchEntitlements();
      setEntitlement(result);
      setLoading(false);
    };

    fetchEntitlements();

    // Refresh on auth state changes
    const interval = setInterval(fetchEntitlements, 60000); // Refresh every minute

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const hasPremium = entitlement.plan === 'premium' || entitlement.plan === 'family';

  return {
    entitlement,
    loading,
    hasPremium,
    canShowUpgrade: ENV_CONFIG.useInAppPurchases,
    marketingUrl: ENV_CONFIG.marketingUrl,
    refresh: async () => {
      const service = EntitlementService.getInstance();
      const result = await service.fetchEntitlements();
      setEntitlement(result);
    },
  };
}

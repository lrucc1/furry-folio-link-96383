import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PlanType, getEntitlements, PLANS } from '@/config/pricing';
import { EntitlementServiceV2, UserUsage } from '@/services/EntitlementServiceV2';

export function usePlanV2() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanType>('FREE');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('none');
  const [trialEndAt, setTrialEndAt] = useState<Date | null>(null);
  const [nextBillingAt, setNextBillingAt] = useState<Date | null>(null);
  const [usage, setUsage] = useState<UserUsage>({
    pets_count: 0,
    caregivers_count: 0,
    reminders_active_count: 0,
    storage_used_mb: 0,
  });
  const [loading, setLoading] = useState(true);

  const entitlement = plan ? getEntitlements(plan) : null;
  const planConfig = plan ? PLANS[plan] : null;

  const fetchPlanData = async () => {
    if (!user?.id) {
      setPlan('FREE');
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan_v2, subscription_status, trial_end_at, next_billing_at')
        .eq('id', user.id)
        .single();

      if (error) {
        console.warn('Error fetching plan data, defaulting to FREE:', error);
        setPlan('FREE');
        setLoading(false);
        return;
      }

      if (data) {
        setPlan((data.plan_v2 as PlanType) || 'FREE');
        setSubscriptionStatus(data.subscription_status || 'none');
        setTrialEndAt(data.trial_end_at ? new Date(data.trial_end_at) : null);
        setNextBillingAt(data.next_billing_at ? new Date(data.next_billing_at) : null);

        // Fetch usage
        const service = EntitlementServiceV2.getInstance();
        const userUsage = await service.getUserUsage(user.id);
        setUsage(userUsage);
      }
    } catch (err) {
      console.error('Failed to fetch plan data:', err);
      setPlan('FREE');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPlanData();

    // Subscribe to realtime changes
    if (user?.id) {
      const channel = supabase
        .channel(`profile-plan-v2-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          () => {
            fetchPlanData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const daysUntilTrialEnd = trialEndAt 
    ? Math.ceil((trialEndAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isTrialActive = plan === 'TRIAL' && daysUntilTrialEnd && daysUntilTrialEnd > 0;

  return {
    plan,
    planConfig,
    subscriptionStatus,
    trialEndAt,
    nextBillingAt,
    entitlement,
    usage,
    loading,
    daysUntilTrialEnd,
    isTrialActive,
    isPro: plan === 'PRO' || plan === 'TRIAL',
    isFree: plan === 'FREE',
    refresh: fetchPlanData,
  };
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PlanType, getEntitlements, PLANS } from '@/config/pricing';

// Helper function to normalize legacy plan types to current FREE/PRO structure
function normalizePlanType(plan: string): PlanType {
  const planUpper = String(plan).toUpperCase();
  
  // Map legacy plans (PREMIUM, TRIAL, FAMILY) to PRO
  if (planUpper === 'PREMIUM' || planUpper === 'TRIAL' || planUpper === 'FAMILY') {
    return 'PRO';
  }
  
  // Valid current plans
  if (planUpper === 'PRO' || planUpper === 'FREE') {
    return planUpper as PlanType;
  }
  
  return 'FREE';
}

export interface UserUsage {
  pets_count: number;
  caregivers_count: number;
  reminders_active_count: number;
  storage_used_mb: number;
}

const DEFAULT_USAGE: UserUsage = {
  pets_count: 0,
  caregivers_count: 0,
  reminders_active_count: 0,
  storage_used_mb: 0,
};

export function usePlanV2() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanType>('FREE');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('none');
  const [trialEndAt, setTrialEndAt] = useState<Date | null>(null);
  const [nextBillingAt, setNextBillingAt] = useState<Date | null>(null);
  const [usage, setUsage] = useState<UserUsage>(DEFAULT_USAGE);
  const [loading, setLoading] = useState(true);
  
  // Cache to prevent redundant fetches
  const cacheRef = useRef<{ timestamp: number } | null>(null);
  const CACHE_DURATION = 10000; // 10 seconds

  const entitlement = plan ? getEntitlements(plan) : null;
  const planConfig = plan ? PLANS[plan] : null;

  const fetchPlanData = useCallback(async (force = false) => {
    if (!user?.id) {
      setPlan('FREE');
      setUsage(DEFAULT_USAGE);
      setLoading(false);
      return;
    }

    // Check cache unless forced
    if (!force && cacheRef.current && Date.now() - cacheRef.current.timestamp < CACHE_DURATION) {
      return;
    }

    setLoading(true);
    
    try {
      // Fetch plan and usage in parallel
      const [profileResult, petsResult, remindersResult, storageResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('plan_v2, subscription_status, trial_end_at, next_billing_at')
          .eq('id', user.id)
          .maybeSingle(),
        supabase
          .from('pets')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('health_reminders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', false),
        supabase
          .from('storage_usage')
          .select('total_bytes')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (profileResult.data) {
        const rawPlan = profileResult.data.plan_v2 || 'FREE';
        setPlan(normalizePlanType(rawPlan));
        setSubscriptionStatus(profileResult.data.subscription_status || 'none');
        setTrialEndAt(profileResult.data.trial_end_at ? new Date(profileResult.data.trial_end_at) : null);
        setNextBillingAt(profileResult.data.next_billing_at ? new Date(profileResult.data.next_billing_at) : null);
      }

      // Set usage from parallel queries
      setUsage({
        pets_count: petsResult.count || 0,
        caregivers_count: 0, // Skip expensive caregiver query for now
        reminders_active_count: remindersResult.count || 0,
        storage_used_mb: storageResult.data ? storageResult.data.total_bytes / (1024 * 1024) : 0,
      });

      cacheRef.current = { timestamp: Date.now() };
    } catch (err) {
      console.error('Failed to fetch plan data:', err);
      setPlan('FREE');
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setPlan('FREE');
      setUsage(DEFAULT_USAGE);
      setLoading(false);
      cacheRef.current = null;
      return;
    }

    fetchPlanData();

    // Single realtime subscription - reuses data from realtime update
    const channel = supabase
      .channel(`plan-v2-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const data = payload.new as any;
          if (data) {
            const rawPlan = data.plan_v2 || 'FREE';
            setPlan(normalizePlanType(rawPlan));
            setSubscriptionStatus(data.subscription_status || 'none');
            setTrialEndAt(data.trial_end_at ? new Date(data.trial_end_at) : null);
            setNextBillingAt(data.next_billing_at ? new Date(data.next_billing_at) : null);
            cacheRef.current = { timestamp: Date.now() };
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchPlanData]);

  const daysUntilTrialEnd = trialEndAt 
    ? Math.ceil((trialEndAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isTrialActive = subscriptionStatus === 'trialing' && daysUntilTrialEnd && daysUntilTrialEnd > 0;

  const refresh = useCallback(async () => {
    cacheRef.current = null;
    await fetchPlanData(true);
  }, [fetchPlanData]);

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
    isPro: plan === 'PRO',
    isFree: plan === 'FREE',
    refresh,
  };
}

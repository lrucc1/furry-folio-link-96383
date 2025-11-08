import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { computeEffectiveTier, Tier, PlanSource, ProfilePlanData } from '@/lib/plan/effectivePlan';
import { useAuth } from '@/contexts/AuthContext';

export function useEffectivePlan() {
  const { user } = useAuth();
  const [tier, setTier] = useState<Tier>('free');
  const [source, setSource] = useState<PlanSource>('stripe');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setTier('free');
      setSource('system');
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan_tier, manual_override, plan_source, plan_v2, subscription_status, stripe_tier, stripe_status')
        .eq('id', user.id)
        .single();

      if (profile) {
        const profileData: ProfilePlanData = {
          plan_tier: profile.plan_tier as Tier | undefined,
          manual_override: profile.manual_override,
          plan_source: profile.plan_source as PlanSource | undefined,
          plan_v2: (profile as any).plan_v2,
          subscription_status: (profile as any).subscription_status,
          stripe_tier: (profile as any).stripe_tier,
          stripe_status: (profile as any).stripe_status,
        };
        setTier(computeEffectiveTier(profileData));
        setSource((profile.plan_source as PlanSource) || 'stripe');
      }
      setLoading(false);
    };

    fetchProfile();

    // Subscribe to realtime changes on this user's profile
    const channel = supabase
      .channel(`profile-plan-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('[useEffectivePlan] Profile updated:', payload);
          const newProfile = payload.new;
          setTier(computeEffectiveTier(newProfile));
          setSource((newProfile.plan_source as PlanSource) || 'stripe');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { tier, source, loading };
}

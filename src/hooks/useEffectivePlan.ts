import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { computeEffectiveTier, Tier, PlanSource } from '@/lib/plan/effectivePlan';
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
        .select('plan_tier, manual_override, plan_source, premium_tier')
        .eq('id', user.id)
        .single();

      if (profile) {
        setTier(computeEffectiveTier(profile));
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

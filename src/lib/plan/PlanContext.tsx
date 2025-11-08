import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { computeEffectiveTier, Tier, PlanSource, ProfilePlanData } from './effectivePlan';
import { useAuth } from '@/contexts/AuthContext';

interface PlanContextValue {
  tier: Tier;
  source: PlanSource;
  profile: ProfilePlanData | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const PlanContext = createContext<PlanContextValue | undefined>(undefined);

export function PlanProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [tier, setTier] = useState<Tier>('free');
  const [source, setSource] = useState<PlanSource>('system');
  const [profile, setProfile] = useState<ProfilePlanData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user?.id) {
      setTier('free');
      setSource('system');
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan_tier, manual_override, plan_source, plan_v2, subscription_status, stripe_status, stripe_tier')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[PlanProvider] Error fetching profile:', error);
        setTier('free');
        setSource('system');
        setProfile(null);
      } else if (data) {
        const profileData: ProfilePlanData = {
          plan_tier: data.plan_tier as Tier | undefined,
          manual_override: data.manual_override,
          plan_source: data.plan_source as PlanSource | undefined,
          // v2 fields
          plan_v2: (data as any).plan_v2,
          subscription_status: (data as any).subscription_status,
          // legacy stripe-derived fields
          stripe_tier: (data as any).stripe_tier,
          stripe_status: (data as any).stripe_status,
        };
        setProfile(profileData);
        setTier(computeEffectiveTier(profileData));
        setSource((data.plan_source as PlanSource) || 'stripe');
      } else {
        // No profile found - set defaults
        setTier('free');
        setSource('system');
        setProfile(null);
      }
    } catch (error) {
      console.error('[PlanProvider] Unexpected error:', error);
      setTier('free');
      setSource('system');
      setProfile(null);
    }
    setLoading(false);
  };

  const refresh = async () => {
    setLoading(true);
    await fetchProfile();
  };

  useEffect(() => {
    if (!user?.id) {
      setTier('free');
      setSource('system');
      setProfile(null);
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchProfile();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`profile-plan-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('[PlanProvider] Profile updated via realtime:', payload);
          const newProfile = payload.new as ProfilePlanData;
          setProfile(newProfile);
          setTier(computeEffectiveTier(newProfile));
          setSource((newProfile.plan_source as PlanSource) || 'stripe');
        }
      )
      .subscribe();

    // Refresh on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchProfile();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);

  return (
    <PlanContext.Provider value={{ tier, source, profile, loading, refresh }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
}

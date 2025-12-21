import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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
  
  // Cache to prevent redundant fetches
  const cacheRef = useRef<{ data: ProfilePlanData | null; timestamp: number } | null>(null);
  const CACHE_DURATION = 10000; // 10 seconds

  const fetchProfile = useCallback(async (force = false) => {
    if (!user?.id) {
      setTier('free');
      setSource('system');
      setProfile(null);
      setLoading(false);
      return;
    }

    // Check cache
    if (!force && cacheRef.current && Date.now() - cacheRef.current.timestamp < CACHE_DURATION) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan_tier, manual_override, plan_source, plan_v2, subscription_status')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        setTier('free');
        setSource('system');
        setProfile(null);
      } else if (data) {
        const profileData: ProfilePlanData = {
          plan_tier: data.plan_tier as Tier | undefined,
          manual_override: data.manual_override,
          plan_source: data.plan_source as PlanSource | undefined,
          plan_v2: (data as any).plan_v2,
          subscription_status: (data as any).subscription_status,
        };
        
        cacheRef.current = { data: profileData, timestamp: Date.now() };
        setProfile(profileData);
        setTier(computeEffectiveTier(profileData));
        setSource((data.plan_source as PlanSource) || 'system');
      } else {
        setTier('free');
        setSource('system');
        setProfile(null);
      }
    } catch {
      setTier('free');
      setSource('system');
      setProfile(null);
    }
    setLoading(false);
  }, [user?.id]);

  const refresh = useCallback(async () => {
    setLoading(true);
    cacheRef.current = null; // Clear cache for manual refresh
    await fetchProfile(true);
  }, [fetchProfile]);

  useEffect(() => {
    if (!user?.id) {
      setTier('free');
      setSource('system');
      setProfile(null);
      setLoading(false);
      cacheRef.current = null;
      return;
    }

    fetchProfile();

    // Single realtime subscription
    const channel = supabase
      .channel(`plan-profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          // Update directly from payload to avoid extra fetch
          const newProfile = payload.new as ProfilePlanData;
          if (newProfile) {
            cacheRef.current = { data: newProfile, timestamp: Date.now() };
            setProfile(newProfile);
            setTier(computeEffectiveTier(newProfile));
            setSource((newProfile.plan_source as PlanSource) || 'system');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchProfile]);

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

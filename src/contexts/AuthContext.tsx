import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { normalizeTier, Tier } from '@/lib/plan/effectivePlan'

interface SubscriptionInfo {
  subscribed: boolean
  product_id: string | null
  tier: Tier
  maxPets: number
  subscription_end: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  subscriptionInfo: SubscriptionInfo
  refreshSubscription: () => Promise<void>
  signOut: () => Promise<void>
}

const SUBSCRIPTION_TIERS = {
  'prod_TGGcRtzlK6vz7A': { tier: 'pro' as Tier, maxPets: -1 },
  'prod_TGGcY3nKNalPuA': { tier: 'pro' as Tier, maxPets: -1 },
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>({
    subscribed: false,
    product_id: null,
    tier: 'free',
    maxPets: 1,
    subscription_end: null,
  })

  const checkSubscription = async () => {
    if (!session?.access_token) return

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        method: 'GET',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      
      if (error) {
        return
      }

      if (data) {
        // Check if this is a manual subscription (from database)
        const isManualSub = data.manual === true
        const tierInfo = data.product_id && SUBSCRIPTION_TIERS[data.product_id as keyof typeof SUBSCRIPTION_TIERS]
        
        // For manual subscriptions, use the tier directly
        let tier: Tier = 'free'
        let maxPets = 1
        const apiEffectiveTier = data.effective_tier as string | undefined;

        if (apiEffectiveTier) {
          tier = normalizeTier(apiEffectiveTier)
          maxPets = tier === 'pro' ? -1 : 1
        } else if (isManualSub && tierInfo) {
          tier = tierInfo.tier
          maxPets = tierInfo.maxPets
        } else if (data.subscribed && tierInfo) {
          tier = tierInfo.tier
          maxPets = tierInfo.maxPets
        }
        
        const newSubInfo: SubscriptionInfo = {
          subscribed: data.subscribed || false,
          product_id: data.product_id,
          tier,
          maxPets,
          subscription_end: data.subscription_end,
        }
        
        setSubscriptionInfo(newSubInfo)

        // Do not write legacy plan_tier here. Webhooks manage plan_v2/subscription_status.
        // Rely on server-side updates to avoid violating legacy CHECK constraints.

      }
    } catch (error) {
      // Error handled silently
    }
  }

  useEffect(() => {
    // Listen for auth changes FIRST to avoid missing events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Check subscription after auth state changes
      if (session?.user) {
        setTimeout(() => checkSubscription(), 0)
      }
    })

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Check subscription for initial session
      if (session?.user) {
        setTimeout(() => checkSubscription(), 0)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Auto-refresh subscription when profiles table changes
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        () => {
          setTimeout(() => checkSubscription(), 100)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

// Periodic subscription check every minute
useEffect(() => {
  if (!user) return

  const interval = setInterval(() => {
    checkSubscription()
  }, 60000)

  return () => clearInterval(interval)
}, [user, session])

// Refresh on window focus or when tab becomes visible for instant updates
useEffect(() => {
  if (!user) return

  const onFocus = () => checkSubscription()
  const onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      checkSubscription()
    }
  }

  window.addEventListener('focus', onFocus)
  document.addEventListener('visibilitychange', onVisibilityChange)

  return () => {
    window.removeEventListener('focus', onFocus)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
}, [user, session])

  const signOut = async () => {
    await supabase.auth.signOut()
    setSubscriptionInfo({
      subscribed: false,
      product_id: null,
      tier: 'free',
      maxPets: 1,
      subscription_end: null,
    })
  }

  const refreshSubscription = async () => {
    await checkSubscription()
  }

  const value = {
    user,
    session,
    loading,
    subscriptionInfo,
    refreshSubscription,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
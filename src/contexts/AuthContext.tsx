import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
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

const DEFAULT_SUBSCRIPTION: SubscriptionInfo = {
  subscribed: false,
  product_id: null,
  tier: 'free',
  maxPets: 1,
  subscription_end: null,
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
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>(DEFAULT_SUBSCRIPTION)
  
  // Debounce mechanism to prevent duplicate calls
  const lastCheckRef = useRef<number>(0)
  const checkInProgressRef = useRef<boolean>(false)
  const MIN_CHECK_INTERVAL = 5000 // 5 seconds minimum between checks

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) return
    
    // Prevent duplicate concurrent calls
    if (checkInProgressRef.current) return
    
    // Throttle calls
    const now = Date.now()
    if (now - lastCheckRef.current < MIN_CHECK_INTERVAL) return
    
    checkInProgressRef.current = true
    lastCheckRef.current = now

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        method: 'GET',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      
      if (error || !data) {
        checkInProgressRef.current = false
        return
      }

      const tierInfo = data.product_id && SUBSCRIPTION_TIERS[data.product_id as keyof typeof SUBSCRIPTION_TIERS]
      
      let tier: Tier = 'free'
      let maxPets = 1
      const apiEffectiveTier = data.effective_tier as string | undefined

      if (apiEffectiveTier) {
        tier = normalizeTier(apiEffectiveTier)
        maxPets = tier === 'pro' ? -1 : 1
      } else if (data.subscribed && tierInfo) {
        tier = tierInfo.tier
        maxPets = tierInfo.maxPets
      }
      
      setSubscriptionInfo({
        subscribed: data.subscribed || false,
        product_id: data.product_id,
        tier,
        maxPets,
        subscription_end: data.subscription_end,
      })
    } catch {
      // Error handled silently
    } finally {
      checkInProgressRef.current = false
    }
  }, [session?.access_token])

  // Initial auth setup - runs once
  useEffect(() => {
    let mounted = true
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Check subscription when session changes
  useEffect(() => {
    if (session?.user) {
      checkSubscription()
    }
  }, [session?.user?.id, checkSubscription])

  // Single realtime subscription for profile changes
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`auth-profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        () => {
          // Reset throttle on realtime update to allow immediate check
          lastCheckRef.current = 0
          checkSubscription()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, checkSubscription])

  // Single visibility handler - only check on tab becoming visible after being hidden
  useEffect(() => {
    if (!user) return

    let wasHidden = false
    
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        wasHidden = true
      } else if (document.visibilityState === 'visible' && wasHidden) {
        wasHidden = false
        checkSubscription()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [user?.id, checkSubscription])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSubscriptionInfo(DEFAULT_SUBSCRIPTION)
  }, [])

  const refreshSubscription = useCallback(async () => {
    lastCheckRef.current = 0 // Reset throttle for manual refresh
    await checkSubscription()
  }, [checkSubscription])

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

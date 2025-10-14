import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface SubscriptionInfo {
  subscribed: boolean
  product_id: string | null
  tier: 'free' | 'premium' | 'family'
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
  'prod_TBUW3WogN0dEtQ': { tier: 'premium' as const, maxPets: 5 },
  'prod_TBUX7Ubgxwr3co': { tier: 'family' as const, maxPets: -1 },
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
    if (!session) return

    try {
      console.log('[AuthContext] Checking subscription for user:', user?.email)
      const { data, error } = await supabase.functions.invoke('check-subscription')
      
      if (error) {
        console.error('[AuthContext] Error checking subscription:', error)
        return
      }

      console.log('[AuthContext] Subscription response:', data)

      if (data) {
        const tierInfo = data.product_id && SUBSCRIPTION_TIERS[data.product_id as keyof typeof SUBSCRIPTION_TIERS]
        
        const newSubInfo: SubscriptionInfo = {
          subscribed: data.subscribed || false,
          product_id: data.product_id,
          tier: (tierInfo?.tier || 'free') as 'free' | 'premium' | 'family',
          maxPets: tierInfo?.maxPets || 1,
          subscription_end: data.subscription_end,
        }

        console.log('[AuthContext] Setting subscription info:', newSubInfo)
        
        setSubscriptionInfo(newSubInfo)

        // Update profile with tier
        if (user && tierInfo) {
          await supabase
            .from('profiles')
            .update({ premium_tier: tierInfo.tier })
            .eq('id', user.id)
        }
      }
    } catch (error) {
      console.error('[AuthContext] Subscription check failed:', error)
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

  // Periodic subscription check every minute
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      checkSubscription()
    }, 60000) // Check every minute

    return () => clearInterval(interval)
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
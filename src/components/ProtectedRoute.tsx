import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const [timeoutReached, setTimeoutReached] = useState(false)
  const [lastAllowedContent, setLastAllowedContent] = useState<React.ReactNode | null>(null)

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined

    if (loading) {
      timer = setTimeout(() => setTimeoutReached(true), 10000)
    } else {
      setTimeoutReached(false)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [loading])

  useEffect(() => {
    if (user) {
      setLastAllowedContent(children)
    }
  }, [user, children])

  const overlayContent = useMemo(() => {
    if (timeoutReached) {
      return (
        <div className="space-y-2 text-center">
          <p className="text-sm text-muted-foreground">Taking longer than expected to confirm access.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-3 py-1 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90"
          >
            Retry
          </button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <div className="animate-spin rounded-full h-5 w-5 border-[3px] border-primary/40 border-b-transparent" />
        <span>Checking your access…</span>
      </div>
    )
  }, [timeoutReached])

  if (loading) {
    return (
      <div className="relative min-h-screen">
        <div className={lastAllowedContent ? 'opacity-60' : 'opacity-100'}>{lastAllowedContent}</div>
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-background/60">
          {overlayContent}
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}
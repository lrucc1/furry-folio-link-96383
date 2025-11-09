import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Logo } from '@/components/Logo'
import { Crown, Mail, Menu } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '@/hooks/useAdmin'
import { UserMenu } from '@/components/UserMenu'
import { PendingInvitesModal } from '@/components/PendingInvitesModal'
import { NotificationsDropdown } from '@/components/NotificationsDropdown'
import { usePlan } from '@/lib/plan/PlanContext'
import { au } from '@/lib/auEnglish'

export const DashboardHeader = () => {
  const { user, signOut } = useAuth()
  const { tier, loading: planLoading } = usePlan()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showInvitesModal, setShowInvitesModal] = useState(false)
  const { isAdmin } = useAdmin()

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <>
      <header className="border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => navigate('/dashboard')}>
              <Menu className="w-5 h-5" />
            </Button>
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
              <Logo />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" className="text-foreground hover:text-primary" asChild>
              <Link to="/dashboard">My Pets</Link>
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary" asChild>
              <Link to="/smart-tags">Smart Tags</Link>
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-primary" asChild>
              <Link to="/reminders">Reminders</Link>
            </Button>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {planLoading ? (
              <Skeleton className="h-6 w-16 sm:w-20" />
            ) : (
              <Badge
                className={
                  tier === 'pro'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0 text-xs sm:text-sm'
                    : 'bg-muted text-muted-foreground text-xs sm:text-sm'
                }
              >
                {tier === 'pro' && <Crown className="w-3 h-3 mr-1" />}
                <span className="hidden sm:inline">{tier === 'pro' ? au('Pro') : au('Free')}</span>
                <span className="sm:hidden">{tier === 'pro' ? 'Pro' : 'Free'}</span>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
              onClick={() => navigate('/invite/status')}
              title={au('View invitations')}
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>

            <NotificationsDropdown />

            <UserMenu />
          </div>
        </div>
      </header>
      
      <PendingInvitesModal 
        open={showInvitesModal} 
        onClose={() => setShowInvitesModal(false)} 
      />
    </>
  )
}
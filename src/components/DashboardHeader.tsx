import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Logo } from '@/components/Logo'
import { Bell, Star, Crown, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '@/hooks/useAdmin'
import { UserMenu } from '@/components/UserMenu'
import { PendingInvitesModal } from '@/components/PendingInvitesModal'
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
      <header className="bg-white border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Logo />
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Button 
                variant="ghost" 
                className="text-foreground hover:text-primary"
                asChild
              >
                <Link to="/dashboard">My Pets</Link>
              </Button>
              <Button 
                variant="ghost" 
                className="text-foreground hover:text-primary"
                asChild
              >
                <Link to="/smart-tags">Smart Tags</Link>
              </Button>
              <Button 
                variant="ghost" 
                className="text-foreground hover:text-primary"
                asChild
              >
                <Link to="/dashboard">Reminders</Link>
              </Button>
            </nav>

            <div className="flex items-center gap-4">
              {planLoading ? (
                <Skeleton className="h-6 w-20" />
              ) : (
                <Badge className={
                  tier === 'family' 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0' 
                    : tier === 'premium' 
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0' 
                    : 'bg-muted text-muted-foreground'
                }>
                  {tier === 'family' && <Crown className="w-3 h-3 mr-1" />}
                  {tier === 'premium' && <Star className="w-3 h-3 mr-1" />}
                  {tier === 'family' ? au('Family') : tier === 'premium' ? au('Premium') : au('Free')}
                </Badge>
              )}

              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/invite/status')}
                title={au('View invitations')}
              >
                <Mail className="w-5 h-5" />
              </Button>

              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <Bell className="w-4 h-4" />
                </Link>
              </Button>

              <UserMenu />
            </div>
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
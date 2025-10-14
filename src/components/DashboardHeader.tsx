import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Logo } from '@/components/Logo'
import { RefreshSubscriptionButton } from '@/components/RefreshSubscriptionButton'
import { User, Settings, LogOut, Bell, Crown, Star } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '@/hooks/useAdmin'

export const DashboardHeader = () => {
  const { user, signOut, subscriptionInfo } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { isAdmin } = useAdmin()

  const getTierDisplay = () => {
    switch (subscriptionInfo.tier) {
      case 'premium':
        return { label: 'Premium', icon: Star, className: 'bg-primary text-primary-foreground' }
      case 'family':
        return { label: 'Family', icon: Crown, className: 'bg-gradient-accent text-accent-foreground' }
      default:
        return { label: 'Free', icon: null, className: 'bg-muted text-muted-foreground' }
    }
  }

  const tierDisplay = getTierDisplay()

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
            <RefreshSubscriptionButton />
            
            <Badge className={tierDisplay.className}>
              {tierDisplay.icon && <tierDisplay.icon className="w-3 h-3 mr-1" />}
              {tierDisplay.label}
            </Badge>

            <Button variant="ghost" size="sm" asChild>
              <Link to="/notifications">
                <Bell className="w-4 h-4" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.email ? getInitials(user.email) : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Manage your pets and account
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={loading}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
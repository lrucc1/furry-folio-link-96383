import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "./Logo";
import { Menu, Plus, Crown, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { UserMenu } from "@/components/UserMenu";
import { usePlan } from "@/lib/plan/PlanContext";
import { au } from "@/lib/auEnglish";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();
  const { tier, loading } = usePlan();
  const navigate = useNavigate();
  return (
    <header className="border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <Logo />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Button
            variant="ghost"
            className="text-foreground hover:text-primary"
            asChild
          >
            <Link to={user ? '/dashboard' : '/auth'}>My Pets</Link>
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
            <Link to={user ? '/reminders' : '/auth'}>Reminders</Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {user ? (
            <>
              {loading ? (
                <Skeleton className="h-6 w-16 sm:w-20" />
              ) : (
              <Badge
                className={
                  tier === 'pro'
                    ? 'hidden xs:flex bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0 text-xs sm:text-sm'
                    : 'hidden xs:flex bg-muted text-muted-foreground text-xs sm:text-sm'
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
              
              {/* Mobile: Icon-only button */}
              <Button 
                variant="hero" 
                size="icon"
                className="md:hidden h-9 w-9"
                onClick={() => navigate('/pets/new')}
                title={au('Add Pet')}
              >
                <Plus className="w-4 h-4" />
              </Button>

              {/* Desktop: Button with text */}
              <Button 
                variant="hero" 
                size="sm"
                className="hidden md:flex"
                onClick={() => navigate('/pets/new')}
              >
                <Plus className="w-4 h-4 mr-1" />
                {au('Add Pet')}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost"
                onClick={() => navigate('/auth')}
              >
                {au('Login')}
              </Button>
              
              <Button 
                variant="hero" 
                size="sm"
                className="hidden sm:flex"
                onClick={() => navigate('/auth')}
              >
                <Plus className="w-4 h-4 mr-1" />
                {au('Add Pet')}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
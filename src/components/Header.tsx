import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "./Logo";
import { Menu, Plus, Star, Crown } from "lucide-react";
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
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Button 
            variant="ghost" 
            className="text-foreground hover:text-primary"
            onClick={() => user ? navigate('/dashboard') : navigate('/auth')}
          >
            My Pets
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
            onClick={() => user ? navigate('/dashboard') : navigate('/auth')}
          >
            Reminders
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {loading ? (
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
              <NotificationsDropdown />
              <UserMenu />
              
              <Button 
                variant="hero" 
                size="sm"
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
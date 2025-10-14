import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "./Logo";
import { Menu, Plus, Crown, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, subscriptionInfo } = useAuth();
  const navigate = useNavigate();

  const getTierDisplay = () => {
    switch (subscriptionInfo.tier) {
      case 'premium':
        return { label: 'Premium', icon: Star, className: 'bg-primary text-primary-foreground' };
      case 'family':
        return { label: 'Family', icon: Crown, className: 'bg-gradient-accent text-accent-foreground' };
      default:
        return { label: 'Free', icon: null as any, className: 'bg-muted text-muted-foreground' };
    }
  };
  const tierDisplay = getTierDisplay();
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
              <Badge className={tierDisplay.className}>
                {tierDisplay.icon && <tierDisplay.icon className="w-3 h-3 mr-1" />}
                {tierDisplay.label}
              </Badge>
              <NotificationsDropdown />
              
              <Button 
                variant="ghost" 
                size="icon"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20"
                onClick={() => navigate('/profile')}
              >
                <span className="text-sm font-semibold text-primary">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </Button>
              
              <Button 
                variant="hero" 
                size="sm"
                onClick={() => navigate('/pets/new')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Pet
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost"
                onClick={() => navigate('/auth')}
              >
                Login
              </Button>
              
              <Button 
                variant="hero" 
                size="sm"
                className="hidden sm:flex"
                onClick={() => navigate('/auth')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Pet
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
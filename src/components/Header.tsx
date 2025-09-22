import { Button } from "@/components/ui/button";
import { Heart, Menu, Bell, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (page: string) => {
    if (!user) {
      navigate('/auth');
    } else {
      switch(page) {
        case 'pets':
          navigate('/dashboard');
          break;
        case 'registry':
          // Navigate to registry page when it exists
          navigate('/dashboard');
          break;
        case 'reminders':
          // Navigate to reminders page when it exists  
          navigate('/dashboard');
          break;
      }
    }
  };
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
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Pet Passport</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Your pet's digital companion</p>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Button 
            variant="ghost" 
            className="text-foreground hover:text-primary"
            onClick={() => handleNavigation('pets')}
          >
            My Pets
          </Button>
          <Button 
            variant="ghost" 
            className="text-foreground hover:text-primary"
            onClick={() => handleNavigation('registry')}
          >
            Registry
          </Button>
          <Button 
            variant="ghost" 
            className="text-foreground hover:text-primary"
            onClick={() => handleNavigation('reminders')}
          >
            Reminders
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-white" />
          </Button>
          
          {user ? (
            <Button 
              variant="ghost" 
              size="icon"
              className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20"
              onClick={() => navigate('/dashboard')}
            >
              <span className="text-sm font-semibold text-primary">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </Button>
          ) : (
            <Button 
              variant="ghost"
              onClick={() => navigate('/auth')}
            >
              Login
            </Button>
          )}
          
          <Button 
            variant="hero" 
            size="sm" 
            className="hidden sm:flex"
            onClick={() => user ? navigate('/pets/new') : navigate('/auth')}
          >
            Add Pet
          </Button>
        </div>
      </div>
    </header>
  );
};
import { Button } from "@/components/ui/button";
import { Heart, Menu, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();
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
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-soft">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Pet Passport</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Your pet's digital companion</p>
            </div>
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
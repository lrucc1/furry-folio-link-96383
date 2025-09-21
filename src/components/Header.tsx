import { Button } from "@/components/ui/button";
import { Heart, Menu, Bell, User } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
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
          <Button variant="ghost" className="text-foreground hover:text-primary">
            My Pets
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-primary">
            Registry
          </Button>
          <Button variant="ghost" className="text-foreground hover:text-primary">
            Reminders
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-white" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <User className="w-5 h-5" />
          </Button>
          
          <Button variant="hero" size="sm" className="hidden sm:flex">
            Add Pet
          </Button>
        </div>
      </div>
    </header>
  );
};
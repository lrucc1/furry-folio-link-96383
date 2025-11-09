import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "./Logo";
import { Menu, Plus, Crown, Mail, Home, Tag, Bell, DollarSign, User, Settings, CreditCard, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { UserMenu } from "@/components/UserMenu";
import { usePlan } from "@/lib/plan/PlanContext";
import { au } from "@/lib/auEnglish";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface HeaderProps {}

export const Header = ({}: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { tier, loading } = usePlan();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] sm:w-[320px]">
          <SheetHeader>
            <SheetTitle>
              <Logo />
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col gap-4 mt-6">
            <Link 
              to={user ? '/dashboard' : '/auth'} 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">My Pets</span>
            </Link>

            <Link 
              to="/smart-tags" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Tag className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Smart Tags</span>
            </Link>

            <Link 
              to={user ? '/reminders' : '/auth'} 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Bell className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Reminders</span>
            </Link>

            <Link 
              to="/pricing" 
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-foreground font-medium">Pricing</span>
            </Link>

            {user && (
              <>
                <Separator className="my-2" />
                
                <Link 
                  to="/account" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">Account</span>
                </Link>

                <Link 
                  to="/settings/billing" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">Billing Settings</span>
                </Link>

                <Link 
                  to="/help" 
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">Help Centre</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left w-full"
                >
                  <LogOut className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">Sign Out</span>
                </button>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <header className="border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={() => setMobileMenuOpen(true)}
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
                    ? 'hidden sm:flex bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0 text-xs sm:text-sm'
                    : 'hidden sm:flex bg-muted text-muted-foreground text-xs sm:text-sm'
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
                className="shrink-0"
                onClick={() => navigate('/invite/status')}
                title={au('View invitations')}
              >
                <Mail className="w-5 h-5 block" />
              </Button>

              <NotificationsDropdown />

              <UserMenu />
              
              {/* Mobile: Icon-only button */}
              <Button 
                variant="hero" 
                size="icon"
                className="md:hidden"
                onClick={() => navigate('/pets/new')}
                title={au('Add Pet')}
              >
                <Plus className="w-5 h-5 block" />
              </Button>

              {/* Desktop: Button with text */}
              <Button 
                variant="hero" 
                className="hidden md:inline-flex h-10"
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
    </>
  );
};
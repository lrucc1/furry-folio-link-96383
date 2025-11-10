import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Logo } from "./Logo";
import { Menu, Plus, Crown, Mail, Home, Tag, Bell, DollarSign, User, Settings, CreditCard, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { UserMenu } from "@/components/UserMenu";
import { usePlan } from "@/lib/plan/PlanContext";
import { au } from "@/lib/auEnglish";
import { Drawer } from "vaul";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {}

export const Header = ({}: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { tier, loading } = usePlan();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [invitesCount, setInvitesCount] = useState(0);

  useEffect(() => {
    if (user?.email) {
      const fetchInvites = async () => {
        const { count } = await supabase
          .from('pet_invites')
          .select('id', { count: 'exact', head: true })
          .eq('email', user.email.toLowerCase())
          .eq('status', 'pending');
        setInvitesCount(count || 0);
      };
      fetchInvites();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <Drawer.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} direction="left">
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="bg-background flex flex-col h-full w-[280px] sm:w-[320px] fixed bottom-0 left-0 z-50 outline-none">
            <div className="flex-1 overflow-y-auto">
              {user ? (
                <div className="p-6 pb-4 bg-gradient-to-br from-primary/5 to-primary/10 border-b">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  {loading ? (
                    <Skeleton className="h-6 w-20" />
                  ) : (
                    <Badge
                      className={
                        tier === 'pro'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {tier === 'pro' && <Crown className="w-3 h-3 mr-1" />}
                      {tier === 'pro' ? au('Pro') : au('Free')}
                    </Badge>
                  )}
                </div>
              ) : (
                <div className="p-6 pb-4 border-b">
                  <Logo />
                </div>
              )}
              
              <div className="flex flex-col gap-1 p-4">
                <Link 
                  to={user ? '/dashboard' : '/auth'} 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-foreground font-medium">My Pets</span>
                </Link>

                <Link 
                  to="/smart-tags" 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Tag className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-foreground font-medium">Smart Tags</span>
                </Link>

                <Link 
                  to={user ? '/reminders' : '/auth'} 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bell className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-foreground font-medium">Reminders</span>
                </Link>

                <Link 
                  to="/pricing" 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <DollarSign className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-foreground font-medium">Pricing</span>
                </Link>

                {user && (
                  <>
                    <Separator className="my-2" />
                    
                    <Link 
                      to="/account" 
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-foreground font-medium">Account</span>
                    </Link>

                    <Link 
                      to="/settings/billing" 
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <CreditCard className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-foreground font-medium">Billing Settings</span>
                    </Link>

                    <Link 
                      to="/help" 
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <HelpCircle className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-foreground font-medium">Help Centre</span>
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-left w-full group"
                    >
                      <LogOut className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-foreground font-medium">Sign Out</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <header className="border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2 md:gap-8">
        <div className="flex items-center gap-2 min-w-0 md:mr-4">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
            <Logo />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
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
                className="relative shrink-0"
                onClick={() => navigate('/invite/status')}
                title={au('View invitations')}
              >
                <Mail className="w-5 h-5 block" />
                {invitesCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center bg-red-600 text-white border-2 border-background">
                    {invitesCount > 9 ? '9+' : invitesCount}
                  </Badge>
                )}
              </Button>

              <NotificationsDropdown />

              <UserMenu />
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
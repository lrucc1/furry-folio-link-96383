import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/lib/plan/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { MobileCard } from '@/components/ios/MobileCard';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, Bell, Shield, CreditCard, Globe, Moon, 
  LogOut, ChevronRight, HelpCircle, FileText, 
  Trash2, Download, Crown, Mail, ChevronLeft, Smartphone, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | React.ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

const SettingsRow = ({ icon, label, value, onClick, showChevron = true, destructive }: SettingsRowProps) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className={`w-full flex items-center gap-3 p-4 text-left touch-manipulation active:bg-muted/50 transition-colors ${
      destructive ? 'text-destructive' : ''
    } ${!onClick ? 'cursor-default' : ''}`}
  >
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
      destructive ? 'bg-destructive/10' : 'bg-muted'
    }`}>
      {icon}
    </div>
    <span className="flex-1 font-medium">{label}</span>
    {value && <span className="text-muted-foreground text-sm">{value}</span>}
    {onClick && showChevron && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
  </button>
);

const SettingsToggle = ({ 
  icon, 
  label, 
  description,
  checked, 
  onCheckedChange 
}: { 
  icon: React.ReactNode; 
  label: string; 
  description?: string;
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void;
}) => (
  <div className="flex items-center gap-3 p-4">
    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
      {icon}
    </div>
    <div className="flex-1">
      <span className="font-medium">{label}</span>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

const SettingsGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6">
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
      {title}
    </h3>
    <MobileCard className="p-0 divide-y divide-border/30 overflow-hidden rounded-3xl">
      {children}
    </MobileCard>
  </div>
);

export default function IOSSettings() {
  const { user, signOut } = useAuth();
  const { tier } = usePlan();
  const navigate = useNavigate();
  const isNative = useIsNativeApp();
  const { isSupported: pushSupported, isRegistered: pushRegistered, permissionStatus, register: registerPush, isLoading: pushLoading } = usePushNotifications();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const handleToggleNotifications = async (type: 'email' | 'reminder', value: boolean) => {
    if (type === 'email') {
      setEmailNotifications(value);
      toast.success(value ? 'Email notifications enabled' : 'Email notifications disabled');
    } else {
      setReminderNotifications(value);
      toast.success(value ? 'Reminder notifications enabled' : 'Reminder notifications disabled');
    }
    // TODO: Persist to database when notification preferences table is added
  };

  const handleEnablePushNotifications = async () => {
    if (!pushSupported) {
      toast.error('Push notifications are only available in the native app');
      return;
    }
    
    const success = await registerPush();
    if (success) {
      toast.success('Push notifications enabled');
    } else {
      toast.error('Failed to enable push notifications. Please check your device settings.');
    }
  };

  const handleDarkModeToggle = (value: boolean) => {
    setDarkMode(value);
    document.documentElement.classList.toggle('dark', value);
    toast.success(value ? 'Dark mode enabled' : 'Light mode enabled');
  };

  const headerLeft = (
    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-10 w-10 p-0">
      <ChevronLeft className="w-6 h-6" />
    </Button>
  );

  if (loading) {
    return (
      <IOSPageLayout title="Settings" headerRight={headerLeft}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </IOSPageLayout>
    );
  }

  return (
    <IOSPageLayout title="Settings" headerRight={headerLeft}>
      <div className="pb-8">
        {/* Profile Header */}
        <MobileCard className="mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{profile?.display_name || 'User'}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant={tier === 'pro' ? 'default' : 'secondary'} className="mt-1">
                {tier === 'pro' ? (
                  <>
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </>
                ) : 'Free'}
              </Badge>
            </div>
          </div>
        </MobileCard>

        {/* Account Settings */}
        <SettingsGroup title="Account">
          <SettingsRow 
            icon={<User className="w-4 h-4" />}
            label="Edit Profile"
            onClick={() => navigate('/settings/profile')}
          />
          <SettingsRow 
            icon={<CreditCard className="w-4 h-4" />}
            label="Subscription"
            value={tier === 'pro' ? 'Pro' : 'Free'}
            onClick={() => navigate('/settings/plans')}
          />
          <SettingsRow 
            icon={<Globe className="w-4 h-4" />}
            label="Region"
            value={profile?.country_code || 'AU'}
            onClick={() => navigate('/settings/profile')}
          />
        </SettingsGroup>

        {/* Notifications */}
        <SettingsGroup title="Notifications">
          <SettingsToggle
            icon={<Mail className="w-4 h-4" />}
            label="Email Notifications"
            description="Receive updates via email"
            checked={emailNotifications}
            onCheckedChange={(v) => handleToggleNotifications('email', v)}
          />
          <SettingsToggle
            icon={<Bell className="w-4 h-4" />}
            label="Reminder Alerts"
            description="Get notified about health reminders"
            checked={reminderNotifications}
            onCheckedChange={(v) => handleToggleNotifications('reminder', v)}
          />
          {isNative && (
            <SettingsRow
              icon={<Smartphone className="w-4 h-4" />}
              label="Push Notifications"
              value={
                pushLoading ? 'Loading...' :
                pushRegistered ? 'Enabled' :
                permissionStatus === 'denied' ? 'Blocked' : 'Disabled'
              }
              onClick={!pushRegistered && permissionStatus !== 'denied' ? handleEnablePushNotifications : undefined}
              showChevron={!pushRegistered && permissionStatus !== 'denied'}
            />
          )}
        </SettingsGroup>

        {/* Appearance */}
        <SettingsGroup title="Appearance">
          <SettingsToggle
            icon={<Moon className="w-4 h-4" />}
            label="Dark Mode"
            checked={darkMode}
            onCheckedChange={handleDarkModeToggle}
          />
        </SettingsGroup>

        {/* Privacy & Security */}
        <SettingsGroup title="Privacy & Security">
          <SettingsRow 
            icon={<Users className="w-4 h-4" />}
            label="Sharing & Privacy"
            onClick={() => navigate('/settings/sharing')}
          />
          <SettingsRow 
            icon={<Shield className="w-4 h-4" />}
            label="Privacy Policy"
            onClick={() => navigate('/settings/privacy-policy')}
          />
          <SettingsRow 
            icon={<FileText className="w-4 h-4" />}
            label="Terms of Service"
            onClick={() => navigate('/settings/terms')}
          />
          <SettingsRow 
            icon={<Download className="w-4 h-4" />}
            label="Export My Data"
            onClick={() => navigate('/settings/export')}
          />
        </SettingsGroup>

        {/* Support */}
        <SettingsGroup title="Support">
          <SettingsRow 
            icon={<HelpCircle className="w-4 h-4" />}
            label="Help Centre"
            onClick={() => navigate('/help')}
          />
          <SettingsRow 
            icon={<Mail className="w-4 h-4" />}
            label="Contact Us"
            onClick={() => navigate('/contact')}
          />
        </SettingsGroup>

        {/* Danger Zone */}
        <SettingsGroup title="Account Actions">
          <SettingsRow 
            icon={<LogOut className="w-4 h-4 text-destructive" />}
            label="Sign Out"
            onClick={handleSignOut}
            destructive
            showChevron={false}
          />
          <SettingsRow 
            icon={<Trash2 className="w-4 h-4 text-destructive" />}
            label="Delete Account"
            onClick={() => navigate('/account')}
            destructive
          />
        </SettingsGroup>

        {/* App Info */}
        <div className="text-center text-xs text-muted-foreground mt-8">
          <p>PetLinkID v1.0.0</p>
          <p className="mt-1">Made with ❤️ in Australia</p>
        </div>
      </div>
    </IOSPageLayout>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/lib/plan/PlanContext';
import { supabase } from '@/integrations/supabase/client';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { PageTransition } from '@/components/ios/PageTransition';
import { MobileCard } from '@/components/ios/MobileCard';
import { IOSSettingsSkeleton } from '@/components/ios/IOSSkeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, Bell, Shield, CreditCard, Globe, Moon, 
  LogOut, ChevronRight, HelpCircle, FileText, 
  Trash2, Download, Crown, Mail, ChevronLeft, Smartphone, Users, Fingerprint
} from 'lucide-react';
import { toast } from 'sonner';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | React.ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

const SettingsRow = ({ icon, label, value, onClick, showChevron = true, destructive }: SettingsRowProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressStart = () => onClick && setIsPressed(true);
  const handlePressEnd = () => setIsPressed(false);

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
      onPointerLeave={handlePressEnd}
      onPointerCancel={handlePressEnd}
      className={`w-full flex items-center gap-3 p-4 text-left touch-manipulation transition-colors ${
        destructive ? 'text-destructive' : ''
      } ${!onClick ? 'cursor-default' : ''} ${isPressed ? 'bg-muted/60' : ''}`}
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
};

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
  <div className="space-y-2">
    <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.12em] px-1">
      {title}
    </h3>
    <MobileCard className="p-0 divide-y divide-border/30 overflow-hidden rounded-3xl shadow-sm">
      {children}
    </MobileCard>
  </div>
);

export default function IOSSettings() {
  const { user, signOut, refreshSubscription } = useAuth();
  const { tier, refresh: refreshPlan, profile: planProfile } = usePlan();
  const navigate = useNavigate();
  const isNative = useIsNativeApp();
  const { isSupported: pushSupported, isRegistered: pushRegistered, permissionStatus, register: registerPush, isLoading: pushLoading } = usePushNotifications();
  const biometric = useBiometricAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingPlan, setRefreshingPlan] = useState(false);
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Debug logging for plan status
  useEffect(() => {
    console.log('[IOSSettings] Current tier:', tier);
    console.log('[IOSSettings] Plan profile:', planProfile);
  }, [tier, planProfile]);

  const handleForceRefreshPlan = async () => {
    setRefreshingPlan(true);
    console.log('[IOSSettings] Force refreshing plan...');
    try {
      await Promise.all([refreshPlan(), refreshSubscription()]);
      toast.success('Plan status refreshed');
      console.log('[IOSSettings] Plan refresh complete, new tier:', tier);
    } catch (error) {
      console.error('[IOSSettings] Plan refresh error:', error);
      toast.error('Failed to refresh plan status');
    } finally {
      setRefreshingPlan(false);
    }
  };

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
        <IOSSettingsSkeleton />
      </IOSPageLayout>
    );
  }

  return (
    <IOSPageLayout title="Settings" headerRight={headerLeft}>
      <PageTransition>
      <div className="space-y-6 px-4 pb-6 pt-2">
        {/* Profile Header */}
        <MobileCard>
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
            value={
              refreshingPlan ? 'Refreshing...' : 
              tier === 'pro' ? 'Pro' : 'Free'
            }
            onClick={() => navigate('/settings/plans')}
          />
          <SettingsRow 
            icon={<Crown className="w-4 h-4" />}
            label="Refresh Plan Status"
            value={refreshingPlan ? 'Refreshing...' : undefined}
            onClick={handleForceRefreshPlan}
            showChevron={false}
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
          {isNative && biometric.isAvailable && (
            <SettingsToggle
              icon={<Fingerprint className="w-4 h-4" />}
              label={`${biometric.biometryName} Sign-in`}
              description="Use biometrics for quick sign-in"
              checked={biometric.hasCredentials}
              onCheckedChange={async (checked) => {
                if (!checked) {
                  await biometric.disable();
                  toast.success('Biometric sign-in disabled');
                } else {
                  toast.info('Please sign out and sign in again to enable biometric authentication');
                }
              }}
            />
          )}
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
            icon={<CreditCard className="w-4 h-4" />}
            label="Subscription Terms"
            onClick={() => navigate('/settings/subscription-terms')}
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
      </PageTransition>
    </IOSPageLayout>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlan } from '@/lib/plan/PlanContext';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { MobileCard } from '@/components/ios/MobileCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, Crown, Check, X, RefreshCw, 
  PawPrint, Bell, FileText, Users, Shield, Download
} from 'lucide-react';
import { toast } from 'sonner';
import { purchasePro, restorePurchases, isAppleIAPAvailable } from '@/lib/appleIap';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';

interface FeatureRowProps {
  icon: React.ReactNode;
  label: string;
  freeValue: string | boolean;
  proValue: string | boolean;
}

const FeatureRow = ({ icon, label, freeValue, proValue }: FeatureRowProps) => (
  <div className="flex items-center py-3 border-b border-border/50 last:border-0">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-6">
      <div className="w-16 text-center">
        {typeof freeValue === 'boolean' ? (
          freeValue ? (
            <Check className="w-5 h-5 text-green-500 mx-auto" />
          ) : (
            <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
          )
        ) : (
          <span className="text-sm text-muted-foreground">{freeValue}</span>
        )}
      </div>
      <div className="w-16 text-center">
        {typeof proValue === 'boolean' ? (
          proValue ? (
            <Check className="w-5 h-5 text-green-500 mx-auto" />
          ) : (
            <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />
          )
        ) : (
          <span className="text-sm font-semibold text-primary">{proValue}</span>
        )}
      </div>
    </div>
  </div>
);

export default function IOSPlans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier } = usePlan();
  const isNative = useIsNativeApp();
  const [upgrading, setUpgrading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const isPro = tier === 'pro';

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      return;
    }

    if (!isAppleIAPAvailable()) {
      toast.error('In-app purchases are not available');
      return;
    }

    setUpgrading(true);
    try {
      await purchasePro('yearly');
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error('Failed to start purchase');
    } finally {
      setUpgrading(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restorePurchases();
      toast.success('Purchases restored');
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Failed to restore purchases');
    } finally {
      setRestoring(false);
    }
  };

  const headerLeft = (
    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-10 w-10 p-0">
      <ChevronLeft className="w-6 h-6" />
    </Button>
  );

  return (
    <IOSPageLayout title="Your Plan" headerRight={headerLeft}>
      <div className="pb-8">
        {/* Current Plan Card */}
        <MobileCard className="mb-6">
          <div className="text-center py-4">
            <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
              isPro ? 'bg-primary/10' : 'bg-muted'
            }`}>
              {isPro ? (
                <Crown className="w-8 h-8 text-primary" />
              ) : (
                <PawPrint className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <h2 className="text-xl font-bold">
              {isPro ? 'PetLinkID Pro' : 'PetLinkID Free'}
            </h2>
            <Badge variant={isPro ? 'default' : 'secondary'} className="mt-2">
              {isPro ? 'Current Plan' : 'Free Plan'}
            </Badge>
          </div>
        </MobileCard>

        {/* Feature Comparison */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
            Feature Comparison
          </h3>
          <MobileCard>
            {/* Header */}
            <div className="flex items-center py-3 px-4 border-b border-border">
              <div className="flex-1">
                <span className="text-sm font-semibold">Features</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="w-16 text-center text-xs font-medium text-muted-foreground">FREE</span>
                <span className="w-16 text-center text-xs font-medium text-primary">PRO</span>
              </div>
            </div>
            
            <div className="px-4">
              <FeatureRow
                icon={<PawPrint className="w-4 h-4" />}
                label="Pet Profiles"
                freeValue="1"
                proValue="Unlimited"
              />
              <FeatureRow
                icon={<Bell className="w-4 h-4" />}
                label="Health Reminders"
                freeValue={true}
                proValue={true}
              />
              <FeatureRow
                icon={<FileText className="w-4 h-4" />}
                label="Document Storage"
                freeValue={false}
                proValue={true}
              />
              <FeatureRow
                icon={<Users className="w-4 h-4" />}
                label="Family Sharing"
                freeValue={false}
                proValue={true}
              />
              <FeatureRow
                icon={<Shield className="w-4 h-4" />}
                label="Lost Pet Mode"
                freeValue={false}
                proValue={true}
              />
              <FeatureRow
                icon={<Download className="w-4 h-4" />}
                label="Data Export"
                freeValue={true}
                proValue={true}
              />
            </div>
          </MobileCard>
        </div>

        {/* Action Buttons */}
        <div className="px-4 space-y-3">
          {!isPro && (
            <Button 
              onClick={handleUpgrade}
              disabled={upgrading}
              className="w-full h-12 text-base font-semibold"
            >
              {upgrading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </>
              )}
            </Button>
          )}
          
          {isPro && isNative && (
            <div className="text-center p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground mb-2">
                Manage your subscription through
              </p>
              <p className="font-medium">Settings → Apple ID → Subscriptions</p>
            </div>
          )}

          {isNative && (
            <Button 
              variant="outline"
              onClick={handleRestore}
              disabled={restoring}
              className="w-full h-12"
            >
              {restoring ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Restore Purchases
                </>
              )}
            </Button>
          )}
        </div>

        {/* Pricing Info */}
        {!isPro && (
          <div className="px-4 mt-6">
            <div className="text-center p-4 bg-muted/30 rounded-xl">
              <p className="text-2xl font-bold">A$39.99<span className="text-sm font-normal text-muted-foreground">/year</span></p>
              <p className="text-sm text-muted-foreground mt-1">
                or A$4.99/month
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Save 33% with yearly billing
              </p>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className="px-4 mt-6">
          <p className="text-xs text-muted-foreground text-center">
            Payment will be charged to your Apple ID account. Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
          </p>
        </div>
      </div>
    </IOSPageLayout>
  );
}

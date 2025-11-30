import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Crown, AlertTriangle, Loader2, CheckCircle2, Smartphone } from 'lucide-react';
import { au } from '@/lib/auEnglish';
import { PLANS } from '@/config/pricing';
import { log } from '@/lib/log';
import { isNativeApp, isIOSApp, isAppleIAPAvailable, purchasePro } from '@/lib/appleIap';
import { usePlanV2 } from '@/hooks/usePlanV2';

interface ManageSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: 'free' | 'pro';
  currentPetCount: number;
  currentStorageMB: number;
  onPlanChange: () => void;
}

const TIER_INFO = {
  free: {
    name: 'Free',
    price: '$0',
    icon: null,
    maxPets: 1,
    maxStorageMB: PLANS.FREE.entitlements.docs_storage_mb,
  },
  pro: {
    name: 'Pro',
    price: '$3.99',
    icon: Crown,
    maxPets: -1,
    maxStorageMB: PLANS.PRO.entitlements.docs_storage_mb,
  },
} as const;

export function ManageSubscriptionModal({
  open,
  onOpenChange,
  currentTier,
  currentPetCount,
  currentStorageMB,
  onPlanChange
}: ManageSubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const { refresh } = usePlanV2();

  const canDowngradeTo = (targetTier: 'free' | 'pro') => {
    const targetLimits = TIER_INFO[targetTier];
    
    const petCheck = targetLimits.maxPets === -1 || currentPetCount <= targetLimits.maxPets;
    const storageCheck = targetLimits.maxStorageMB === 0 || currentStorageMB <= targetLimits.maxStorageMB;
    
    return {
      canDowngrade: petCheck && storageCheck,
      petIssue: !petCheck,
      storageIssue: !storageCheck,
      petsToDelete: petCheck ? 0 : currentPetCount - targetLimits.maxPets,
      storageToFree: storageCheck ? 0 : currentStorageMB - targetLimits.maxStorageMB
    };
  };

  const handleUpgrade = async (targetTier: 'pro') => {
    setLoading(true);
    try {
      // Check if we should use Apple IAP (iOS native app)
      if (isNativeApp() && isIOSApp()) {
        if (isAppleIAPAvailable()) {
          await purchasePro('monthly');
          // Refresh plan data after purchase
          await refresh();
          onPlanChange();
          onOpenChange(false);
          toast.success(au('Welcome to Pro!'));
        } else {
          toast.error('In-app purchases are not configured. Please try again later.');
        }
        return;
      }

      // For non-iOS platforms, show message about iOS-only purchases
      toast.info(au('Upgrades are available via the iOS app through Apple In-App Purchases.'));
    } catch (error) {
      log.error('[Upgrade] Error:', error);
      toast.error(au('Failed to start upgrade process'));
    } finally {
      setLoading(false);
    }
  };

  const handleManageAppleSubscription = () => {
    toast.info(au('To manage your subscription, go to Settings → Apple ID → Subscriptions on your device.'));
  };

  const renderPlanOption = (tier: 'free' | 'pro') => {
    if (tier === currentTier) return null;
    
    const tierInfo = TIER_INFO[tier];
    const Icon = tierInfo.icon;
    const isUpgrade = currentTier === 'free' && tier === 'pro';
    const isDowngrade = !isUpgrade;
    
    const validation = isDowngrade ? canDowngradeTo(tier) : { 
      canDowngrade: true, 
      petIssue: false, 
      storageIssue: false, 
      petsToDelete: 0, 
      storageToFree: 0 
    };

    // Show iOS-only message for upgrades on non-iOS platforms
    const showIOSOnlyMessage = isUpgrade && (!isNativeApp() || !isIOSApp());

    return (
      <Card key={tier} className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5" />}
            <div>
              <h3 className="font-semibold">{tierInfo.name}</h3>
              <p className="text-sm text-muted-foreground">{tierInfo.price}/month</p>
            </div>
          </div>
          <Badge variant={isUpgrade ? 'default' : 'secondary'}>
            {isUpgrade ? au('Upgrade') : au('Downgrade')}
          </Badge>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{tierInfo.maxPets === -1 ? au('Unlimited pets') : `${tierInfo.maxPets} ${tierInfo.maxPets === 1 ? 'pet' : 'pets'}`}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>{tierInfo.maxStorageMB === 0 ? au('No storage') : `${tierInfo.maxStorageMB}MB storage`}</span>
          </div>
        </div>

        {isDowngrade && !validation.canDowngrade && (
          <Alert variant="destructive" className="mb-3">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-xs">
              {validation.petIssue && (
                <div>{au(`You need to delete ${validation.petsToDelete} pet(s) first`)}</div>
              )}
              {validation.storageIssue && (
                <div>{au(`You need to free up ${validation.storageToFree.toFixed(1)}MB of storage first`)}</div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {showIOSOnlyMessage && (
          <Alert className="mb-3">
            <Smartphone className="w-4 h-4" />
            <AlertDescription className="text-xs">
              {au('Upgrades are available via the iOS app through Apple In-App Purchases.')}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={() => isUpgrade ? handleUpgrade(tier) : handleManageAppleSubscription()}
          disabled={loading || (isDowngrade && !validation.canDowngrade) || showIOSOnlyMessage}
          className="w-full"
          variant={isUpgrade ? 'default' : 'outline'}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {au('Loading...')}
            </>
          ) : isDowngrade ? (
            au(`Manage via Apple`)
          ) : showIOSOnlyMessage ? (
            au('Use iOS App to Upgrade')
          ) : (
            au(`Upgrade to ${tierInfo.name}`)
          )}
        </Button>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {au('Manage Subscription')}
          </DialogTitle>
          <DialogDescription>
            {isNativeApp() && isIOSApp() 
              ? au('Manage your subscription through Apple In-App Purchases')
              : au('Subscriptions are managed via the iOS app')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4 bg-muted">
            <h3 className="font-semibold mb-2">{au('Current Usage')}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{au('Pets:')}</span>
                <span className="ml-2 font-medium">{currentPetCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{au('Storage:')}</span>
                <span className="ml-2 font-medium">{currentStorageMB.toFixed(1)}MB</span>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <h3 className="font-semibold">{au('Available Plans')}</h3>
            {renderPlanOption('free')}
            {renderPlanOption('pro')}
          </div>

          {currentTier === 'pro' && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                {au('Your subscription is managed through Apple. To cancel or make changes:')}
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside mb-3">
                <li>{au('Open Settings on your iPhone')}</li>
                <li>{au('Tap your Apple ID at the top')}</li>
                <li>{au('Tap Subscriptions')}</li>
                <li>{au('Find and tap PetLinkID')}</li>
              </ol>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

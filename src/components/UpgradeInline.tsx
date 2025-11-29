import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePlan } from '@/lib/plan/PlanContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Crown, Smartphone } from 'lucide-react';
import { au } from '@/lib/auEnglish';
import { isNativeApp, isIOSApp, purchasePro } from '@/lib/appleIap';
import { PaidPlanInfoSheet } from '@/components/PaidPlanInfoSheet';
import { toast } from 'sonner';

interface UpgradeInlineProps {
  feature: string;
}

export function UpgradeInline({ feature }: UpgradeInlineProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const { tier } = usePlan();

  const isOnIOS = isNativeApp() && isIOSApp();

  // Don't show upgrade CTA for pro plan users
  if (tier === 'pro') {
    return null;
  }

  const handleUpgrade = async () => {
    setBusy(true);
    
    // iOS app: use Apple IAP directly
    if (isOnIOS) {
      try {
        await purchasePro('monthly');
        toast.success('Welcome to Pro!');
        navigate('/billing-success');
      } catch (error) {
        // Error already handled in purchasePro
        console.error('Purchase error:', error);
      } finally {
        setBusy(false);
      }
      return;
    }
    
    // Web: Navigate to pricing page with how-to-upgrade info
    navigate('/pricing#how-to-upgrade');
    setBusy(false);
  };

  return (
    <>
      <div className="rounded-xl border border-primary/20 p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">{au('Paid Feature')}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {au('This feature is available on our')} <strong>{au('Pro')}</strong> {au('plan')}.
            </p>
            {isOnIOS ? (
              <Button 
                onClick={handleUpgrade} 
                disabled={busy}
                size="sm"
                className="gap-2"
              >
                <Crown className="w-4 h-4" />
                {busy ? 'Processing...' : au('Upgrade to Pro')}
              </Button>
            ) : (
              <Button 
                onClick={handleUpgrade} 
                disabled={busy}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Smartphone className="w-4 h-4" />
                {au('Learn how to upgrade')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <PaidPlanInfoSheet open={showInfoSheet} onOpenChange={setShowInfoSheet} />
    </>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlan } from '@/lib/plan/PlanContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { au } from '@/lib/auEnglish';
import { getEnvironmentConfig } from '@/config/environment';
import { isIOSApp, openWebCheckout } from '@/lib/iosPaymentFlow';
import { PaidPlanInfoSheet } from '@/components/PaidPlanInfoSheet';

const ENV_CONFIG = getEnvironmentConfig();

interface UpgradeInlineProps {
  feature: string;
}

export function UpgradeInline({ feature }: UpgradeInlineProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const { tier } = usePlan();

  // Don't show upgrade CTA for family plan users (no upgrade path)
  if (tier === 'pro') {
    return null;
  }

  const handleUpgrade = async () => {
    setBusy(true);
    
    // iOS app: Open web checkout in Safari
    if (isIOSApp()) {
      await openWebCheckout(user?.id);
      setBusy(false);
      return;
    }
    
    // Web: Show info sheet if IAPs disabled, otherwise navigate to pricing
    if (!ENV_CONFIG.useInAppPurchases) {
      setShowInfoSheet(true);
      setBusy(false);
      return;
    }
    
    navigate('/pricing');
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
            <Button 
              onClick={handleUpgrade} 
              disabled={busy}
              size="sm"
              className="gap-2"
            >
              <Crown className="w-4 h-4" />
              {au('View Paid Plans')}
            </Button>
          </div>
        </div>
      </div>

      <PaidPlanInfoSheet open={showInfoSheet} onOpenChange={setShowInfoSheet} />
    </>
  );
}

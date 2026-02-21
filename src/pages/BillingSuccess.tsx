import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Sparkles, Crown } from 'lucide-react';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { MobileCard } from '@/components/ios/MobileCard';
import { usePlanV2 } from '@/hooks/usePlanV2';
import { isNativeApp } from '@/lib/appleIap';

export default function BillingSuccess() {
  const navigate = useNavigate();
  const { refresh } = usePlanV2();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyAndRefresh = async () => {
      await refresh();
      setVerifying(false);
    };

    verifyAndRefresh();
  }, [refresh]);

  // Auto-navigate after verification
  useEffect(() => {
    if (!verifying && isNativeApp()) {
      const timer = setTimeout(() => {
        navigate('/ios-home');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [verifying, navigate]);

  const IOSSuccessContent = () => (
    <div className="space-y-6 text-center">
      <MobileCard className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="py-6">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Welcome to Pro!</h1>
          
          <p className="text-muted-foreground">
            You now have access to all premium features
          </p>
        </div>
      </MobileCard>

      <MobileCard>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-500" />
            <span>Unlimited pet profiles</span>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>Full health tracking</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Priority support</span>
          </div>
        </div>
      </MobileCard>

      <Button 
        onClick={() => navigate('/ios-home')} 
        className="w-full h-12 rounded-full text-base font-semibold"
      >
        Return to Home
      </Button>
      
      <p className="text-xs text-muted-foreground">
        You'll be redirected automatically in a few seconds
      </p>
    </div>
  );

  const LoadingContent = () => (
    <MobileCard className="text-center py-12">
      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">Verifying...</h2>
      <p className="text-muted-foreground">Please wait while we confirm your subscription</p>
    </MobileCard>
  );

  return (
    <IOSPageLayout title="Success" showTabBar={false}>
      <div className="px-4 py-6 max-w-md mx-auto">
        {verifying ? <LoadingContent /> : <IOSSuccessContent />}
      </div>
    </IOSPageLayout>
  );
}

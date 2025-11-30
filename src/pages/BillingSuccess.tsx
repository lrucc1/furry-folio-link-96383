import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Sparkles, Crown } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { MobileCard } from '@/components/ios/MobileCard';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';
import { usePlanV2 } from '@/hooks/usePlanV2';
import { isNativeApp } from '@/lib/appleIap';

export default function BillingSuccess() {
  const navigate = useNavigate();
  const { refresh } = usePlanV2();
  const isNativeHook = useIsNativeApp();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyAndRefresh = async () => {
      // Just refresh the plan data from the profile
      await refresh();
      setVerifying(false);
    };

    verifyAndRefresh();
  }, [refresh]);

  // Auto-navigate for iOS users after verification
  useEffect(() => {
    if (!verifying && isNativeApp()) {
      const timer = setTimeout(() => {
        navigate('/ios-home');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [verifying, navigate]);

  // iOS-compliant success content (NO payment info)
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

  // Loading state
  const LoadingContent = () => (
    <MobileCard className="text-center py-12">
      <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">Verifying...</h2>
      <p className="text-muted-foreground">Please wait while we confirm your subscription</p>
    </MobileCard>
  );

  // iOS Layout (Apple compliant - NO payment info)
  if (isNativeHook) {
    return (
      <IOSPageLayout title="Success" showTabBar={false}>
        <div className="px-4 py-6 max-w-md mx-auto">
          {verifying ? <LoadingContent /> : <IOSSuccessContent />}
        </div>
      </IOSPageLayout>
    );
  }

  // Web Layout (can show more details)
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {verifying ? (
            <Card>
              <CardContent className="pt-6">
                <LoadingContent />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-3xl">Welcome to Pro!</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Your subscription is now active
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <span>Unlimited pet profiles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>Full health tracking & reminders</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Priority support</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="flex-1"
                  >
                    Go to Dashboard
                  </Button>
                  <Button 
                    onClick={() => navigate('/account')}
                    variant="outline"
                    className="flex-1"
                  >
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

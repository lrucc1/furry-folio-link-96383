import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { MobileCard } from '@/components/ios/MobileCard';
import { useIsNativeApp } from '@/hooks/useIsNativeApp';

export default function BillingCancel() {
  const navigate = useNavigate();
  const isNative = useIsNativeApp();

  // iOS-compliant content (NO payment references)
  const IOSCancelContent = () => (
    <div className="space-y-6 text-center">
      <MobileCard>
        <div className="py-6">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          
          <h1 className="text-xl font-bold mb-2">Checkout Cancelled</h1>
          
          <p className="text-muted-foreground text-sm">
            No changes have been made to your account.
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            You can upgrade anytime from your Account settings.
          </p>
        </div>
      </MobileCard>

      <Button 
        onClick={() => navigate('/ios-home')} 
        className="w-full h-12 rounded-full text-base font-semibold"
      >
        <Home className="w-4 h-4 mr-2" />
        Return to Home
      </Button>
    </div>
  );

  // iOS Layout (Apple compliant)
  if (isNative) {
    return (
      <IOSPageLayout title="Cancelled" showTabBar={false}>
        <div className="px-4 py-6 max-w-md mx-auto">
          <IOSCancelContent />
        </div>
      </IOSPageLayout>
    );
  }

  // Web Layout
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">Checkout Cancelled</CardTitle>
              <CardDescription className="text-lg mt-2">
                Your subscription checkout was cancelled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-muted-foreground">
                <p>No charges have been made to your account.</p>
                <p className="mt-2">You can try again anytime you're ready to upgrade to Pro.</p>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => navigate('/pricing')}
                  className="flex-1"
                >
                  View Plans
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

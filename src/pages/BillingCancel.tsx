import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle, Home } from 'lucide-react';
import { IOSPageLayout } from '@/components/ios/IOSPageLayout';
import { MobileCard } from '@/components/ios/MobileCard';

export default function BillingCancel() {
  const navigate = useNavigate();

  return (
    <IOSPageLayout title="Cancelled" showTabBar={false}>
      <div className="px-4 py-6 max-w-md mx-auto">
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
      </div>
    </IOSPageLayout>
  );
}

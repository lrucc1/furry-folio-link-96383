import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function BillingCancel() {
  const navigate = useNavigate();

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

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="mb-8">
              <div className="text-8xl font-bold text-primary mb-4">404</div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Page Not Found
              </h1>
              <p className="text-muted-foreground">
                Sorry, we couldn't find the page you're looking for. The link may be broken or the page may have been removed.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate(-1)}
                variant="outline"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <Button 
                onClick={() => navigate('/')}
                variant="default"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t">
              <p className="text-sm text-muted-foreground mb-4">
                Looking for something specific?
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <Button variant="link" onClick={() => navigate('/dashboard')}>
                  My Pets Dashboard
                </Button>
                <Button variant="link" onClick={() => navigate('/smart-tags')}>
                  Smart Tags
                </Button>
                <Button variant="link" onClick={() => navigate('/help')}>
                  Help Centre
                </Button>
                <Button variant="link" onClick={() => navigate('/contact')}>
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
    </div>
  );
};

export default NotFound;

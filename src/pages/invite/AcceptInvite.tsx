import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { au } from '@/lib/auEnglish';
import { Check, X, Loader2 } from 'lucide-react';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');
  const [petId, setPetId] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(au('Invalid invite link'));
      return;
    }

    // If not signed in, redirect to auth page with return URL
    if (!user) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      navigate(`/auth?returnTo=${returnUrl}`);
      return;
    }

    // User is signed in, accept the invite
    acceptInvite();
  }, [user, token]);

  const acceptInvite = async () => {
    if (!token || processing) return;

    setProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('accept-invite', {
        body: { token }
      });

      if (error) throw error;

      if (data.ok) {
        setStatus('success');
        setMessage(au('You now have access to this pet.'));
        setPetId(data.pet_id);
        toast.success(au('Invite accepted'));
      } else {
        throw new Error('Failed to accept invite');
      }
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      setStatus('error');
      setMessage(error.message || au('Failed to accept invite'));
      toast.error(error.message || au('Failed to accept invite'));
    } finally {
      setProcessing(false);
    }
  };

  const handleGoToPet = () => {
    if (petId) {
      navigate(`/pets/${petId}`);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">{au('Accept invite')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {processing && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">{au('Processing invite...')}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{au('Success!')}</h3>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="flex flex-col gap-2">
                {petId && (
                  <Button onClick={handleGoToPet} className="w-full">
                    {au('View pet profile')}
                  </Button>
                )}
                <Button variant="outline" onClick={handleGoToDashboard} className="w-full">
                  {au('Go to dashboard')}
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{au('Error')}</h3>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Button variant="outline" onClick={handleGoToDashboard} className="w-full">
                {au('Go to dashboard')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

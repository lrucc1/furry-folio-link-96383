import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { au } from '@/lib/auEnglish';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { log } from '@/lib/log';

interface Invite {
  id: string;
  pet_id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  pet?: {
    name: string;
    species: string;
  };
}

interface PendingInvitesModalProps {
  open: boolean;
  onClose: () => void;
}

export function PendingInvitesModal({ open, onClose }: PendingInvitesModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPendingInvites = useCallback(async () => {
    if (!user) return;

    try {
      log.debug('[PendingInvites] Fetching invites');
      
      const { data, error } = await supabase
        .from('pet_invites')
        .select('*')
        .eq('email', user.email.toLowerCase())
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      // Fetch pet details separately
      const invitesWithPets = await Promise.all(
        (data || []).map(async (invite) => {
          const { data: pet } = await supabase
            .from('pets')
            .select('name, species')
            .eq('id', invite.pet_id)
            .single();

          return {
            ...invite,
            pet: pet || undefined
          };
        })
      );

      setInvites(invitesWithPets);
    } catch (error) {
      log.error('[PendingInvites] Error fetching invites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (open && user) {
      fetchPendingInvites();
    }
  }, [open, user, fetchPendingInvites]);

  const handleAccept = async (token: string, petId: string) => {
    setProcessing(token);

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
        toast.success(au('Invite accepted'));
        setInvites(invites.filter(inv => inv.token !== token));
        
        // Optionally navigate to the pet
        setTimeout(() => {
          navigate(`/pets/${petId}`);
          onClose();
        }, 1000);
      } else {
        throw new Error('Failed to accept invite');
      }
    } catch (error: any) {
      log.error('Error accepting invite:', error);
      toast.error(error.message || au('Failed to accept invite'));
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (inviteId: string) => {
    setProcessing(inviteId);

    try {
      const { error } = await supabase
        .from('pet_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      if (error) throw error;

      toast.success(au('Invite declined'));
      setInvites(invites.filter(inv => inv.id !== inviteId));
    } catch (error) {
      log.error('Error declining invite:', error);
      toast.error(au('Failed to decline invite'));
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {au('Pending invitations')}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">{au('Loading invites...')}</p>
          </div>
        ) : invites.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{au('No pending invites')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invites.map((invite) => (
              <Card key={invite.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">
                        {invite.pet?.name || au('Pet')}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {invite.pet?.species}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {au(invite.role)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {au('Expires on')} {new Date(invite.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(invite.token, invite.pet_id)}
                        disabled={processing !== null}
                      >
                        {processing === invite.token ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {au('Accept')}
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDecline(invite.id)}
                        disabled={processing !== null}
                      >
                        {processing === invite.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            {au('Decline')}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

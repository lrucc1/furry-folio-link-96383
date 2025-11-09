import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { toast } from 'sonner';
import { au } from '@/lib/auEnglish';

interface Invite {
  id: string;
  pet_id: string;
  email: string;
  role: string;
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
  pet?: {
    name: string;
    species: string;
    photo_url?: string;
  };
}

interface Membership {
  id: string;
  user_id: string;
  pet_id: string;
  role: string;
  created_at: string;
  pet?: {
    name: string;
    species: string;
    photo_url?: string;
  };
}

export default function InviteStatus() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInvites();
    }
  }, [user]);

  const fetchInvites = async () => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
        .from('pet_invites')
        .select('*')
        .eq('email', user.email.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch pet details for each invite
      const invitesWithPets = await Promise.all(
        (data || []).map(async (invite) => {
          const { data: pet } = await supabase
            .from('pets')
            .select('name, species, photo_url')
            .eq('id', invite.pet_id)
            .single();

          return {
            ...invite,
            pet: pet || undefined
          };
        })
      );

      setInvites(invitesWithPets);

      // Fetch active memberships for this user
      const { data: membershipsData, error: membershipError } = await supabase
        .from('pet_memberships')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (membershipError) throw membershipError;

      // Fetch pet details for each membership
      const membershipsWithPets = await Promise.all(
        (membershipsData || []).map(async (membership) => {
          const { data: pet } = await supabase
            .from('pets')
            .select('name, species, photo_url')
            .eq('id', membership.pet_id)
            .single();

          return {
            ...membership,
            pet: pet || undefined
          };
        })
      );

      setMemberships(membershipsWithPets);
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast.error(au('Failed to load invites'));
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (token: string, petId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('accept-invite', {
        body: { token }
      });

      if (error) throw error;

      if (data.ok) {
        toast.success(au('Invite accepted successfully'));
        fetchInvites(); // Refresh the list
        // Navigate to the pet after a short delay
        setTimeout(() => {
          navigate(`/pets/${petId}`);
        }, 1000);
      } else {
        throw new Error('Failed to accept invite');
      }
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      toast.error(error.message || au('Failed to accept invite'));
    }
  };

  const handleDecline = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('pet_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);

      if (error) throw error;

      toast.success(au('Invite declined'));
      fetchInvites(); // Refresh the list
    } catch (error) {
      console.error('Error declining invite:', error);
      toast.error(au('Failed to decline invite'));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'declined':
      case 'revoked':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'declined':
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {au('Pet Invitations')}
          </h1>
          <p className="text-muted-foreground">
            {au('Manage your pet invitation status')}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{au('Loading invitations...')}</p>
          </div>
        ) : invites.length === 0 && memberships.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Mail className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">{au('No invitations or shared pets')}</h3>
              <p className="text-muted-foreground">
                {au('You have not received any pet invitations and have no shared pets yet.')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {/* Active Shares Section */}
            {memberships.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{au('Active Shares')}</h2>
                <div className="grid gap-4">
                  {memberships.map((membership) => (
                    <Card key={membership.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {membership.pet?.photo_url && (
                              <img 
                                src={membership.pet.photo_url} 
                                alt={membership.pet.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            )}
                            <span>{membership.pet?.name || au('Unknown Pet')}</span>
                          </div>
                          <Badge variant="secondary">
                            {membership.role === 'vet' ? au('Veterinarian') : 
                             membership.role === 'family' ? au('Family') :
                             au('Caregiver')}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">{au('Species')}:</span>{' '}
                              {membership.pet?.species || au('Unknown')}
                            </div>
                            <div>
                              <span className="font-medium">{au('Role')}:</span>{' '}
                              {membership.role === 'vet' && au('Veterinarian - Read-only medical access')}
                              {membership.role === 'family' && au('Family - Can view and edit')}
                              {membership.role === 'caregiver' && au('Caregiver - Read-only access')}
                            </div>
                            <div>
                              <span className="font-medium">{au('Shared on')}:</span>{' '}
                              {new Date(membership.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            onClick={() => navigate(`/pets/${membership.pet_id}`)}
                            className="w-full mt-4"
                          >
                            {au('View Pet Profile')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Invitations Section */}
            {invites.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">{au('Pending Invites')}</h2>
                <div className="grid gap-4">
            {invites.map((invite) => (
              <Card key={invite.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(invite.status)}
                      <span>{invite.pet?.name || au('Unknown Pet')}</span>
                    </div>
                    <Badge className={getStatusColor(invite.status)}>
                      {au(invite.status)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">{au('Species')}:</span>{' '}
                        {invite.pet?.species || au('Unknown')}
                      </div>
                      <div>
                        <span className="font-medium">{au('Role')}:</span>{' '}
                        {au(invite.role)}
                      </div>
                      <div>
                        <span className="font-medium">{au('Invited')}:</span>{' '}
                        {new Date(invite.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">{au('Expires')}:</span>{' '}
                        {new Date(invite.expires_at).toLocaleDateString()}
                      </div>
                    </div>

                    {invite.status === 'pending' && new Date(invite.expires_at) > new Date() && (
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={() => handleAccept(invite.token, invite.pet_id)}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {au('Accept')}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDecline(invite.id)}
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {au('Decline')}
                        </Button>
                      </div>
                    )}

                    {invite.status === 'accepted' && invite.pet_id && (
                      <Button
                        onClick={() => {
                          console.log('Navigating to pet:', invite.pet_id);
                          navigate(`/pets/${invite.pet_id}`);
                        }}
                        className="w-full mt-4"
                      >
                        {au('View Pet Profile')}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
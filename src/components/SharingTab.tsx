import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Copy, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { InviteFamilyModal } from './InviteFamilyModal';
import { au } from '@/lib/auEnglish';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
interface SharingTabProps {
  petId: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  token: string;
  pet_id: string;
  invited_by: string;
}

interface Member {
  id: string;
  user_id: string;
  pet_id: string;
  role: string;
  created_at: string;
  email?: string;
  display_name?: string;
}

interface PetInfo {
  id: string;
  name: string;
  species: string;
}

export function SharingTab({ petId }: SharingTabProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [petsById, setPetsById] = useState<Record<string, PetInfo>>({});
  useEffect(() => {
    console.log('[SharingTab] useEffect triggered with:', { user: !!user, petId });
    if (user) {
      fetchSharingData();
    }
  }, [user, petId]);

  const fetchSharingData = async () => {
    if (!user) {
      console.log('[SharingTab] No user');
      setLoading(false);
      return;
    }

    console.log('[SharingTab] Starting fetch with user:', {
      id: user.id,
      email: user.email,
      petId: petId
    });
    setLoading(true);

    // Fetch ALL invites (both sent by user and sent to user) - including pending and revoked
    try {
      console.log('[SharingTab] Building query...');
      const query = supabase
        .from('pet_invites')
        .select('*')
        .or(`invited_by.eq.${user.id},email.eq.${user.email?.toLowerCase()}`)
        .in('status', ['pending', 'revoked'])
        .order('created_at', { ascending: false });

      console.log('[SharingTab] Executing query...');
      const { data: inviteData, error: inviteError } = await query;

      console.log('[SharingTab] Query completed:', {
        data: inviteData,
        error: inviteError,
        dataLength: inviteData?.length || 0
      });

      if (inviteError) {
        console.error('[SharingTab] Error fetching invites:', inviteError);
        setInvites([]);
      } else {
        console.log('[SharingTab] Setting invites:', inviteData?.length || 0, 'items');
        setInvites(inviteData || []);

        // Fetch pet names for these invites
        const petIds = Array.from(new Set((inviteData || []).map((i) => i.pet_id)));
        console.log('[SharingTab] Fetching pet info for IDs:', petIds);
        
        if (petIds.length > 0) {
          const { data: petsData, error: petsError } = await supabase
            .from('pets')
            .select('id, name, species')
            .in('id', petIds);
            
          console.log('[SharingTab] Pet info query result:', { data: petsData, error: petsError });
          
          if (petsError) {
            console.error('[SharingTab] Error fetching pet info:', petsError);
            setPetsById({});
          } else {
            const map: Record<string, PetInfo> = {};
            (petsData || []).forEach((p: any) => { map[p.id] = p as PetInfo; });
            console.log('[SharingTab] Setting pets map:', map);
            setPetsById(map);
          }
        } else {
          setPetsById({});
        }
      }
    } catch (e) {
      console.error('[SharingTab] Unexpected error fetching invites:', e);
      setInvites([]);
      setPetsById({});
    }

    // Fetch members for this specific pet with their profile info
  try {
    // 1) Fetch memberships for this pet (no FK joins to avoid REST relationship errors)
    const { data: memberData, error: memberError } = await supabase
      .from('pet_memberships')
      .select('*')
      .eq('pet_id', petId);

    console.log('[SharingTab] Members raw for petId', petId, ':', { data: memberData, error: memberError });

    if (memberError) {
      console.error('[SharingTab] Error fetching members:', memberError);
      setMembers([]);
    } else {
      // 2) Fetch profiles for those users in a separate query (no FK required)
      const userIds = Array.from(new Set((memberData || []).map((m: any) => m.user_id)));
      let profilesById: Record<string, { email?: string; display_name?: string }> = {};

      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, display_name')
          .in('id', userIds);

        console.log('[SharingTab] Profiles query result:', { data: profilesData, error: profilesError });

        if (!profilesError && profilesData) {
          profilesData.forEach((p: any) => {
            profilesById[p.id] = { email: p.email, display_name: p.display_name };
          });
        } else if (profilesError) {
          console.error('[SharingTab] Error fetching profiles for members:', profilesError);
        }
      }

      // 3) Merge profiles into memberships for display
      const membersWithProfiles = (memberData || []).map((m: any) => ({
        ...m,
        email: profilesById[m.user_id]?.email,
        display_name: profilesById[m.user_id]?.display_name,
      }));

      setMembers(membersWithProfiles);
    }
  } catch (e) {
    console.error('[SharingTab] Unexpected error fetching members:', e);
    setMembers([]);
  }

    setLoading(false);
  };

  const handleInviteSuccess = (inviteUrl: string) => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success(au('Invite link copied to clipboard'));
    setModalOpen(false);
    // Force refetch after a short delay to ensure the invite is saved
    setTimeout(() => {
      fetchSharingData();
    }, 500);
  };

  const copyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/accept?token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success(au('Invite link copied'));
  };

  const revokeInvite = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('pet_invites')
        .update({ status: 'revoked' })
        .eq('id', inviteId);

      if (error) throw error;
      toast.success(au('Invite revoked'));
      fetchSharingData();
    } catch (error) {
      console.error('Error revoking invite:', error);
      toast.error(au('Failed to revoke invite'));
    }
  };

  const removeMember = async (membershipId: string) => {
    try {
      const { error } = await supabase
        .from('pet_memberships')
        .delete()
        .eq('id', membershipId);

      if (error) throw error;
      toast.success(au('Member removed'));
      fetchSharingData();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(au('Failed to remove member'));
    }
  };

  if (loading) {
    console.log('[SharingTab] Still loading...');
    return <div className="text-center py-8">{au('Loading...')}</div>;
  }

  console.log('[SharingTab] Rendering component with state:', {
    invites: invites.length,
    members: members.length,
    user: !!user,
    petId,
    invitesData: invites,
    membersData: members
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {au('Family & Caregivers')}
            </CardTitle>
            <Button onClick={() => setModalOpen(true)} size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              {au('Invite')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Debug: invites={invites.length}, members={members.length}, loading={loading} */}
          {/* Pending Invites Section */}
          {invites.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {au('Pending Invites')}
              </h3>
              {invites.map((invite) => {
                const isSentByMe = invite.invited_by === user?.id;
                const isForMe = invite.email.toLowerCase() === user?.email?.toLowerCase();
                const isRevoked = invite.status === 'revoked';
                
                return (
                  <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{invite.email}</p>
                        {isRevoked && (
                          <Badge variant="destructive" className="text-xs">
                            {au('revoked')}
                          </Badge>
                        )}
                        {!isRevoked && (
                          <Badge variant="outline" className="text-xs">
                            {isSentByMe && !isForMe && au('Sent by you')}
                            {!isSentByMe && isForMe && au('Sent to you')}
                            {isSentByMe && isForMe && au('Self-invite')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invite.role === 'vet' && au('Veterinarian - Read-only medical access')}
                        {invite.role === 'family' && au('Family - Can view and edit')}
                        {invite.role === 'caregiver' && au('Caregiver - Read-only access')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {au('For')}: {petsById[invite.pet_id]?.name || au('Unknown pet')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {au('Expires')} {new Date(invite.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Show different actions based on whether user sent or received the invite */}
                    {isRevoked ? (
                      // Revoked invites - show remove button
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from('pet_invites')
                              .delete()
                              .eq('id', invite.id);
                            
                            if (error) throw error;
                            toast.success(au('Invite removed'));
                            fetchSharingData();
                          } catch (error) {
                            console.error('Error removing invite:', error);
                            toast.error(au('Failed to remove invite'));
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {au('Remove')}
                      </Button>
                    ) : isSentByMe && !isForMe ? (
                      // Sent by current user to someone else - show copy/revoke
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInviteLink(invite.token)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {au('Copy Link')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => revokeInvite(invite.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {au('Revoke')}
                        </Button>
                      </div>
                    ) : isForMe ? (
                      // Sent to current user - show accept/decline
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const acceptUrl = `/invite/accept?token=${invite.token}`;
                            navigate(acceptUrl);
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {au('Accept')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeInvite(invite.id)}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {au('Decline')}
                        </Button>
                      </div>
                    ) : (
                      // Fallback - just show status
                      <Badge variant="secondary">{au('Pending')}</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Members Section */}
          {members.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {au('Active Shares')}
              </h3>
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{member.display_name || member.email || member.user_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.role === 'vet' && au('Veterinarian - Read-only medical access')}
                      {member.role === 'family' && au('Family - Can view and edit')}
                      {member.role === 'caregiver' && au('Caregiver - Read-only access')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {au('For')}: {petsById[member.pet_id]?.name || au('This pet')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                      {member.role === 'vet' ? au('Veterinarian') : 
                       member.role === 'family' ? au('Family') :
                       member.role === 'caregiver' ? au('Caregiver') :
                       au('Owner')}
                    </Badge>
                    {member.role !== 'owner' && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {au('Remove')}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {members.length === 0 && invites.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{au('No members yet')}</p>
              <p className="text-sm mt-1">{au('Click "Invite family member" to share access')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <InviteFamilyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        petId={petId}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
}

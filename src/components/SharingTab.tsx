import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { InviteFamilyModal } from './InviteFamilyModal';
import { au } from '@/lib/auEnglish';
import { useAuth } from '@/contexts/AuthContext';
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
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface PetInfo {
  id: string;
  name: string;
  species: string;
}

export function SharingTab({ petId }: SharingTabProps) {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [petsById, setPetsById] = useState<Record<string, PetInfo>>({});
useEffect(() => {
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

    console.log('[SharingTab] Fetching sharing data (global invites) for user:', user.id);
    setLoading(true);

    // Fetch invites created by current user (across all pets)
    try {
      const { data: inviteData, error: inviteError } = await supabase
        .from('pet_invites')
        .select('*')
        .eq('invited_by', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (inviteError) {
        console.error('[SharingTab] Error fetching invites:', inviteError);
        setInvites([]);
      } else {
        setInvites(inviteData || []);

        // Fetch pet names for these invites
        const petIds = Array.from(new Set((inviteData || []).map((i) => i.pet_id)));
        if (petIds.length > 0) {
          const { data: petsData, error: petsError } = await supabase
            .from('pets')
            .select('id, name, species')
            .in('id', petIds);
          if (petsError) {
            console.error('[SharingTab] Error fetching pet info:', petsError);
            setPetsById({});
          } else {
            const map: Record<string, PetInfo> = {};
            (petsData || []).forEach((p: any) => { map[p.id] = p as PetInfo; });
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

    // Fetch members
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('pet_memberships')
        .select('*')
        .eq('pet_id', petId);

      console.log('[SharingTab] Members result:', { data: memberData, error: memberError });

      if (memberError) {
        console.error('[SharingTab] Error fetching members:', memberError);
        setMembers([]);
      } else {
        setMembers(memberData || []);
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
    return <div className="text-center py-8">{au('Loading...')}</div>;
  }

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
              {au('Invite family member')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Pending Invites Section */}
          {invites.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {au('Pending Invites')}
              </h3>
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{invite.email}</p>
                      <Badge variant="outline" className="text-xs">
                        {au('Pending')}
                      </Badge>
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
                </div>
              ))}
            </div>
          )}

          {/* Active Members Section */}
          {members.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {au('Active Members')}
              </h3>
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{member.user_id}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.role === 'vet' && au('Veterinarian - Read-only medical access')}
                      {member.role === 'family' && au('Family - Can view and edit')}
                      {member.role === 'caregiver' && au('Caregiver - Read-only access')}
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

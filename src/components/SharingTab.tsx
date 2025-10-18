import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { InviteFamilyModal } from './InviteFamilyModal';
import { au } from '@/lib/auEnglish';

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
}

interface Member {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export function SharingTab({ petId }: SharingTabProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (petId) {
      fetchSharingData();
    }
  }, [petId]);

  const fetchSharingData = async () => {
    if (!petId) {
      setLoading(false);
      return;
    }

    let hadError = false;
    let invitesRes: Invite[] | null = null;
    let membersRes: Member[] | null = null;

    // Fetch invites
    try {
      const { data: inviteData, error: inviteError } = await supabase
        .from('pet_invites')
        .select('*')
        .eq('pet_id', petId)
        .eq('status', 'pending');

      if (inviteError) {
        console.error('Error fetching invites:', inviteError);
        hadError = true;
        setInvites([]);
      } else {
        invitesRes = inviteData || [];
        setInvites(invitesRes);
      }
    } catch (e) {
      console.error('Unexpected error fetching invites:', e);
      hadError = true;
      setInvites([]);
    }

    // Fetch members
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('pet_memberships')
        .select('*')
        .eq('pet_id', petId);

      if (memberError) {
        console.error('Error fetching members:', memberError);
        hadError = true;
        setMembers([]);
      } else {
        membersRes = memberData || [];
        setMembers(membersRes);
      }
    } catch (e) {
      console.error('Unexpected error fetching members:', e);
      hadError = true;
      setMembers([]);
    }

    if (hadError && (!invitesRes?.length && !membersRes?.length)) {
      toast.warning(au('Some sharing data may be unavailable right now'));
    }

    setLoading(false);
  };

  const handleInviteSuccess = (inviteUrl: string) => {
    navigator.clipboard.writeText(inviteUrl);
    toast.success(au('Invite link copied to clipboard'));
    fetchSharingData();
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
          {members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{member.user_id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                      {member.role === 'owner' ? au('Owner') : au(member.role)}
                    </Badge>
                    {member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMember(member.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>{au('No members yet')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{au('Pending invites')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{invite.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {au('Expires on')} {new Date(invite.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{au(invite.role)}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyInviteLink(invite.token)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => revokeInvite(invite.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <InviteFamilyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        petId={petId}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
}

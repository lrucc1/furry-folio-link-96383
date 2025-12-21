import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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

  const fetchSharingData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch ALL invites (both sent by user and sent to user) - including pending and revoked
    try {
      const query = supabase
        .from('pet_invites')
        .select('*')
        .or(`invited_by.eq.${user.id},email.eq.${user.email?.toLowerCase()}`)
        .in('status', ['pending', 'revoked'])
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: inviteData, error: inviteError } = await query;

      if (inviteError) {
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
      setInvites([]);
      setPetsById({});
    }

    // Fetch members for this specific pet with their profile info
  try {
    // 1) Fetch memberships for this pet (no FK joins to avoid REST relationship errors)
    const { data: memberData, error: memberError } = await supabase
      .from('pet_memberships')
      .select('*')
      .eq('pet_id', petId)
      .limit(50);

    if (memberError) {
      setMembers([]);
    } else {
      // 2) Fetch profiles for those users in a separate query (no FK required)
      const userIds = Array.from(new Set((memberData || []).map((m: any) => m.user_id)));
      const profilesById: Record<string, { email?: string; display_name?: string }> = {};

      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, display_name')
          .in('id', userIds);

        if (!profilesError && profilesData) {
          profilesData.forEach((p: any) => {
            profilesById[p.id] = { email: p.email, display_name: p.display_name };
          });
        }
      }

      // 3) Also try to get invite emails for members without profile data
      const inviteEmailsByUserId: Record<string, string> = {};
      const { data: acceptedInvites } = await supabase
        .from('pet_invites')
        .select('email, status')
        .eq('pet_id', petId)
        .eq('status', 'accepted');
      
      // Match accepted invite emails to user IDs by checking if they accepted
      if (acceptedInvites) {
        // We'll use these emails as fallbacks
        acceptedInvites.forEach((inv: any) => {
          // Store by lowercase email for matching
          inviteEmailsByUserId[inv.email.toLowerCase()] = inv.email;
        });
      }

      // 4) Merge profiles into memberships for display
      const membersWithProfiles = (memberData || []).map((m: any) => {
        const profile = profilesById[m.user_id];
        // Try to find matching invite email if no profile data
        let inviteEmail: string | undefined;
        if (!profile?.email && !profile?.display_name) {
          // Check all accepted invites - the member likely came from one
          const matchingInvite = acceptedInvites?.find((inv: any) => 
            inv.email && inv.status === 'accepted'
          );
          inviteEmail = matchingInvite?.email;
        }
        
        return {
          ...m,
          email: profile?.email || inviteEmail,
          display_name: profile?.display_name,
        };
      });

      setMembers(membersWithProfiles);
    }
  } catch (e) {
    setMembers([]);
  }

    setLoading(false);
  }, [user, petId]);

  useEffect(() => {
    if (user) {
      fetchSharingData();
    }
  }, [user, petId, fetchSharingData]);

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
                  <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg bg-muted/30">
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate max-w-[250px] sm:max-w-none" title={invite.email}>{invite.email}</p>
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
                            toast.error(au('Failed to remove invite'));
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {au('Remove')}
                      </Button>
                    ) : isSentByMe && !isForMe ? (
                      // Sent by current user to someone else - show copy/revoke
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInviteLink(invite.token)}
                          className="w-full sm:w-auto"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          {au('Copy Link')}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {au('Revoke')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{au('Revoke invitation?')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {au('This will cancel the invitation sent to')} <strong>{invite.email}</strong>. {au('They will not be able to use this link to accept.')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{au('Cancel')}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => revokeInvite(invite.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {au('Revoke Invite')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ) : isForMe ? (
                      // Sent to current user - show accept/decline
                      <div className="flex flex-col gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          onClick={() => {
                            const acceptUrl = `/invite/accept?token=${invite.token}`;
                            navigate(acceptUrl);
                          }}
                          className="w-full"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {au('Accept')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeInvite(invite.id)}
                          className="w-full"
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
              {members.map((member) => {
                // Create a friendly display name
                const getRoleFriendlyName = (role: string) => {
                  switch (role) {
                    case 'vet': return au('Veterinarian');
                    case 'family': return au('Family Member');
                    case 'caregiver': return au('Caregiver');
                    default: return au('Member');
                  }
                };
                
                const displayName = member.display_name || 
                  member.email || 
                  `Invited ${getRoleFriendlyName(member.role)}`;
                
                return (
                <div key={member.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate max-w-[200px] sm:max-w-none" 
                         title={member.display_name || member.email || undefined}>
                        {displayName}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground break-words">
                      {member.role === 'vet' && au('Veterinarian - Read-only medical access')}
                      {member.role === 'family' && au('Family - Can view and edit')}
                      {member.role === 'caregiver' && au('Caregiver - Read-only access')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {au('For')}: {petsById[member.pet_id]?.name || au('This pet')}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:ml-4">
                    <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                      {member.role === 'vet' ? au('Veterinarian') : 
                       member.role === 'family' ? au('Family') :
                       member.role === 'caregiver' ? au('Caregiver') :
                       au('Owner')}
                    </Badge>
                    {member.role !== 'owner' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {au('Remove')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{au('Remove access?')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {au('This will remove')} <strong>{member.display_name || member.email || 'this member'}</strong> 
                              {au("'s access to")} <strong>{petsById[member.pet_id]?.name || 'this pet'}</strong>. {au('They will no longer be able to view or edit this pet.')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{au('Cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => removeMember(member.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {au('Remove Access')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              )})}
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

import { json, buildCors } from '../_shared/cors.ts';
import { makeAnonClient, makeServiceClient } from '../_shared/clients.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: buildCors(req) });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[admin-delete-account] Missing Authorization header');
      return json(req, { error: 'Missing authorization header' }, 401);
    }

    const client = makeAnonClient(authHeader);

    // Get the authenticated admin user
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      console.error('[admin-delete-account] Auth error:', authError);
      return json(req, { error: 'Unauthorized' }, 401);
    }

    // Verify admin role
    const { data: isAdmin, error: roleError } = await client.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (roleError || !isAdmin) {
      console.error('[admin-delete-account] Admin check failed:', roleError);
      return json(req, { error: 'Admin access required' }, 403);
    }

    const { user_id, immediate = false, reason } = await req.json();
    if (!user_id) {
      return json(req, { error: 'user_id is required' }, 400);
    }

    console.log(`[admin-delete-account] Admin deleting account (immediate: ${immediate})`);

    const adminClient = makeServiceClient();

    // Get target user's profile
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('id, email, display_name')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      console.error('[admin-delete-account] Profile not found:', profileError);
      return json(req, { error: 'Account not found' }, 404);
    }

    if (immediate) {
      // Immediate hard delete
      console.log('[admin-delete-account] Performing immediate hard delete');

      // Delete all user data (cascading deletes will handle related records)
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(user_id);

      if (deleteError) {
        console.error('[admin-delete-account] Hard delete failed:', deleteError);
        return json(req, { error: 'Failed to delete account' }, 500);
      }

      // Log to audit trail
      await adminClient.from('plan_audit').insert({
        actor_id: user.id,
        target_id: user_id,
        action: 'admin_hard_delete',
        new_tier: 'deleted',
        note: reason || 'Admin initiated immediate deletion',
      });

      console.log('[admin-delete-account] Successfully hard deleted account');
      return json(req, {
        success: true,
        message: 'Account deleted immediately',
        deletion_type: 'immediate',
      });
    } else {
      // Soft delete with 30-day grace period
      const deletionDate = new Date();
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({
          deleted_at: deletionDate.toISOString(),
          deletion_scheduled: true,
        })
        .eq('id', user_id);

      if (updateError) {
        console.error('[admin-delete-account] Soft delete failed:', updateError);
        return json(req, { error: 'Failed to schedule deletion' }, 500);
      }

      // Log to audit trail
      await adminClient.from('plan_audit').insert({
        actor_id: user.id,
        target_id: user_id,
        action: 'admin_delete',
        new_tier: 'pending_deletion',
        note: reason || 'Admin initiated soft deletion (30-day grace period)',
      });

      const hardDeleteDate = new Date(deletionDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      console.log(`[admin-delete-account] Account scheduled for deletion. Hard delete on: ${hardDeleteDate.toISOString()}`);

      return json(req, {
        success: true,
        message: 'Account scheduled for deletion',
        deletion_type: 'soft',
        deleted_at: deletionDate.toISOString(),
        hard_delete_date: hardDeleteDate.toISOString(),
      });
    }
  } catch (error) {
    console.error('[admin-delete-account] Unexpected error:', error);
    return json(req, { error: 'Internal server error' }, 500);
  }
});

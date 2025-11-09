import { json, buildCors } from '../_shared/cors.ts';
import { makeAnonClient } from '../_shared/clients.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: buildCors(req) });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[restore-account] Missing Authorization header');
      return json(req, { error: 'Missing authorization header' }, 401);
    }

    const client = makeAnonClient(authHeader);

    // Get the authenticated user
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      console.error('[restore-account] Auth error:', authError);
      return json(req, { error: 'Unauthorized' }, 401);
    }

    // Verify admin role
    const { data: isAdmin, error: roleError } = await client.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (roleError || !isAdmin) {
      console.error('[restore-account] Admin check failed:', roleError);
      return json(req, { error: 'Admin access required' }, 403);
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return json(req, { error: 'user_id is required' }, 400);
    }

    console.log(`[restore-account] Admin ${user.id} restoring account ${user_id}`);

    // Check if account is scheduled for deletion
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('id, email, display_name, deletion_scheduled, deleted_at')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      console.error('[restore-account] Profile not found:', profileError);
      return json(req, { error: 'Account not found' }, 404);
    }

    if (!profile.deletion_scheduled) {
      return json(req, { error: 'Account is not scheduled for deletion' }, 400);
    }

    // Restore the account
    const { error: updateError } = await client
      .from('profiles')
      .update({
        deleted_at: null,
        deletion_scheduled: false,
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('[restore-account] Update failed:', updateError);
      return json(req, { error: 'Failed to restore account' }, 500);
    }

    console.log(`[restore-account] Successfully restored account ${user_id}`);

    return json(req, {
      success: true,
      message: 'Account restored successfully',
      user: {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
      },
    });
  } catch (error) {
    console.error('[restore-account] Unexpected error:', error);
    return json(req, { error: 'Internal server error' }, 500);
  }
});

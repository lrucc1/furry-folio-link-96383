import { corsHeaders } from '../_shared/cors.ts';
import { makeAnonClient } from '../_shared/clients.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[restore-account] Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const client = makeAnonClient(authHeader);

    // Get the authenticated user
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      console.error('[restore-account] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role
    const { data: isAdmin, error: roleError } = await client.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (roleError || !isAdmin) {
      console.error('[restore-account] Admin check failed:', roleError);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      return new Response(
        JSON.stringify({ error: 'Account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile.deletion_scheduled) {
      return new Response(
        JSON.stringify({ error: 'Account is not scheduled for deletion' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      return new Response(
        JSON.stringify({ error: 'Failed to restore account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[restore-account] Successfully restored account ${user_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account restored successfully',
        user: {
          id: profile.id,
          email: profile.email,
          display_name: profile.display_name,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[restore-account] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

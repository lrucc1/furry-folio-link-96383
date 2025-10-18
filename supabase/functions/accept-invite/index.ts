import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header. Please sign in first.');
    }

    const authToken = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authToken);

    if (userError || !user) {
      throw new Error('Unauthorized. Please sign in first.');
    }

    const { token } = await req.json();

    if (!token) {
      throw new Error('Missing required field: token');
    }

    // Look up invite by token
    const { data: invite, error: inviteError } = await supabaseClient
      .from('pet_invites')
      .select('*')
      .eq('token', token)
      .single();

    if (inviteError || !invite) {
      throw new Error('Invite not found or invalid');
    }

    // Check if invite is already accepted, revoked, or expired
    if (invite.status !== 'pending') {
      throw new Error(`Invite is ${invite.status}`);
    }

    // Check if invite has expired
    if (new Date(invite.expires_at) < new Date()) {
      // Update status to expired
      await supabaseClient
        .from('pet_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id);
      throw new Error('Invite has expired');
    }

    // Check if user email matches invite email (case-insensitive)
    if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
      throw new Error('This invite was sent to a different email address');
    }

    // Insert into pet_memberships
    const { error: membershipError } = await supabaseClient
      .from('pet_memberships')
      .insert({
        pet_id: invite.pet_id,
        user_id: user.id,
        role: invite.role
      });

    if (membershipError) {
      // Check if already a member
      if (membershipError.code === '23505') {
        throw new Error('You are already a member of this pet');
      }
      throw membershipError;
    }

    // Update invite status to accepted
    const { error: updateError } = await supabaseClient
      .from('pet_invites')
      .update({ status: 'accepted' })
      .eq('id', invite.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ ok: true, pet_id: invite.pet_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in accept-invite:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

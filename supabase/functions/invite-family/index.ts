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
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { pet_id, email, role } = await req.json();

    if (!pet_id || !email || !role) {
      throw new Error('Missing required fields: pet_id, email, role');
    }

    if (!['family', 'caregiver', 'vet'].includes(role)) {
      throw new Error('Invalid role. Must be "family", "caregiver" or "vet"');
    }

    // Check if user owns this pet
    const { data: pet, error: petError } = await supabaseClient
      .from('pets')
      .select('user_id')
      .eq('id', pet_id)
      .single();

    if (petError || !pet) {
      throw new Error('Pet not found');
    }

    if (pet.user_id !== user.id) {
      throw new Error('You do not own this pet');
    }

    // Generate secure token
    const token_value = crypto.randomUUID() + '-' + Date.now().toString(36);

    // Insert invite
    const { data: invite, error: inviteError } = await supabaseClient
      .from('pet_invites')
      .insert({
        pet_id,
        email,
        role,
        token: token_value,
        invited_by: user.id,
        status: 'pending'
      })
      .select()
      .single();

    if (inviteError) {
      throw inviteError;
    }

    const origin = req.headers.get('origin') || Deno.env.get('VITE_APP_URL') || 'http://localhost:8080';
    const inviteUrl = `${origin}/invite/accept?token=${token_value}`;

    return new Response(
      JSON.stringify({ inviteUrl, invite }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in invite-family:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

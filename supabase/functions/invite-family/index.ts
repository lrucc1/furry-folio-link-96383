import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const InviteSchema = z.object({
  pet_id: z.string().uuid({ message: "Invalid pet ID format" }),
  email: z.string().email({ message: "Invalid email address" }).max(255, { message: "Email too long" }),
  role: z.enum(['family', 'caregiver', 'vet'], { 
    errorMap: () => ({ message: 'Role must be "family", "caregiver", or "vet"' })
  })
});

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

    const body = await req.json();
    
    // Validate input
    const validation = InviteSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      console.error('[invite-family] Validation error:', errors);
      return new Response(
        JSON.stringify({ error: 'Invalid input data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { pet_id, email, role } = validation.data;

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
        email: email.toLowerCase(),
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
      JSON.stringify({ error: 'Unable to process invite request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

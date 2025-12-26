import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

const getRoleDescription = (role: string): string => {
  switch (role) {
    case 'family': return 'Family Member';
    case 'caregiver': return 'Caregiver';
    case 'vet': return 'Veterinarian';
    default: return role;
  }
};

const getRolePermissions = (role: string): string => {
  switch (role) {
    case 'family': return 'view and edit pet information';
    case 'caregiver': return 'view pet information and health records';
    case 'vet': return 'view and update medical records';
    default: return 'view pet information';
  }
};

const generateEmailHtml = (
  inviterName: string,
  petName: string,
  role: string,
  inviteUrl: string
): string => {
  const roleDescription = getRoleDescription(role);
  const rolePermissions = getRolePermissions(role);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You've been invited to PetLinkID</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">PetLinkID</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Pet Care Made Connected</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px 0; color: #18181b; font-size: 24px; font-weight: 600;">
                    You're Invited! 🎉
                  </h2>
                  
                  <p style="margin: 0 0 24px 0; color: #52525b; font-size: 16px; line-height: 1.6;">
                    <strong style="color: #18181b;">${inviterName}</strong> has invited you to help care for their pet <strong style="color: #7c3aed;">${petName}</strong> as a <strong>${roleDescription}</strong>.
                  </p>
                  
                  <div style="background-color: #faf5ff; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #6b21a8; font-size: 14px;">
                      <strong>What you'll be able to do:</strong><br>
                      As a ${roleDescription}, you'll be able to ${rolePermissions}.
                    </p>
                  </div>
                  
                  <p style="margin: 0 0 24px 0; color: #52525b; font-size: 16px; line-height: 1.6;">
                    Click the button below to accept this invitation. If you don't have a PetLinkID account yet, you'll be able to create one for free.
                  </p>
                  
                  <!-- CTA Button -->
                  <table role="presentation" style="width: 100%;">
                    <tr>
                      <td style="text-align: center; padding: 8px 0 32px 0;">
                        <a href="${inviteUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                          Accept Invitation
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 16px 0; color: #71717a; font-size: 14px;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="margin: 0; padding: 12px; background-color: #f4f4f5; border-radius: 6px; word-break: break-all; font-size: 12px; color: #52525b;">
                    ${inviteUrl}
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #fafafa; padding: 24px 40px; border-top: 1px solid #e4e4e7;">
                  <p style="margin: 0 0 8px 0; color: #71717a; font-size: 12px; text-align: center;">
                    This invitation will expire in 7 days.
                  </p>
                  <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                    If you didn't expect this invitation, you can safely ignore this email.
                  </p>
                </td>
              </tr>
            </table>
            
            <!-- Sub-footer -->
            <table role="presentation" style="max-width: 600px; margin: 24px auto 0 auto;">
              <tr>
                <td style="text-align: center;">
                  <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                    © ${new Date().getFullYear()} PetLinkID. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
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

    // Check if user owns this pet and get pet details
    const { data: pet, error: petError } = await supabaseClient
      .from('pets')
      .select('user_id, name')
      .eq('id', pet_id)
      .single();

    if (petError || !pet) {
      throw new Error('Pet not found');
    }

    if (pet.user_id !== user.id) {
      throw new Error('You do not own this pet');
    }

    // Get inviter's profile for the email
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('display_name, full_name, email')
      .eq('id', user.id)
      .single();

    const inviterName = profile?.display_name || profile?.full_name || profile?.email || 'A PetLinkID user';

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

    const origin = req.headers.get('origin') || Deno.env.get('VITE_APP_URL') || 'https://petlinkid.io';
    const inviteUrl = `${origin}/invite/accept?token=${token_value}`;

    // Send invite email
    try {
      const emailHtml = generateEmailHtml(inviterName, pet.name, role, inviteUrl);
      
      const emailResponse = await resend.emails.send({
        from: 'PetLinkID <noreply@petlinkid.io>',
        to: [email.toLowerCase()],
        subject: `${inviterName} invited you to care for ${pet.name} on PetLinkID`,
        html: emailHtml,
      });

      console.log('[invite-family] Email sent successfully:', emailResponse);
    } catch (emailError) {
      // Log error but don't fail the invite - user can still use the link
      console.error('[invite-family] Failed to send email:', emailError);
    }

    return new Response(
      JSON.stringify({ inviteUrl, invite, emailSent: true }),
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

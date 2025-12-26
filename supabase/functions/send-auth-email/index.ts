import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { Resend } from 'https://esm.sh/resend@2.0.0';
import { SignupEmail } from './_templates/signup.tsx';
import { RecoveryEmail } from './_templates/recovery.tsx';
import { MagicLinkEmail } from './_templates/magic-link.tsx';
import { EmailChangeEmail } from './_templates/email-change.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET');

interface AuthEmailPayload {
  user: {
    email: string;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: 'signup' | 'recovery' | 'magiclink' | 'email_change';
    site_url: string;
    token_new?: string;
    token_hash_new?: string;
  };
}

const getSubject = (actionType: string): string => {
  switch (actionType) {
    case 'signup':
      return 'Welcome to PetLinkID - Confirm Your Email';
    case 'recovery':
      return 'Reset Your PetLinkID Password';
    case 'magiclink':
      return 'Your PetLinkID Login Link';
    case 'email_change':
      return 'Confirm Your New Email Address';
    default:
      return 'PetLinkID';
  }
};

const buildConfirmationUrl = (
  supabaseUrl: string,
  tokenHash: string,
  actionType: string,
  redirectTo: string
): string => {
  return `${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=${actionType}&redirect_to=${encodeURIComponent(redirectTo)}`;
};

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  // Verify webhook signature if secret is configured
  if (hookSecret) {
    try {
      const wh = new Webhook(hookSecret);
      wh.verify(payload, headers);
    } catch (error) {
      console.error('Webhook verification failed:', error);
      return new Response(
        JSON.stringify({ error: { http_code: 401, message: 'Invalid webhook signature' } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  try {
    const { user, email_data }: AuthEmailPayload = JSON.parse(payload);
    const { token, token_hash, redirect_to, email_action_type, site_url } = email_data;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? site_url;
    const confirmationUrl = buildConfirmationUrl(supabaseUrl, token_hash, email_action_type, redirect_to);

    console.log(`Processing ${email_action_type} email for ${user.email}`);

    let html: string;
    
    switch (email_action_type) {
      case 'signup':
        html = SignupEmail({ confirmationUrl, token });
        break;
      case 'recovery':
        html = RecoveryEmail({ recoveryUrl: confirmationUrl, token });
        break;
      case 'magiclink':
        html = MagicLinkEmail({ magicLinkUrl: confirmationUrl, token });
        break;
      case 'email_change':
        html = EmailChangeEmail({ confirmationUrl, token });
        break;
      default:
        console.error(`Unknown email action type: ${email_action_type}`);
        return new Response(
          JSON.stringify({ error: { message: `Unknown action type: ${email_action_type}` } }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const { error } = await resend.emails.send({
      from: 'PetLinkID <noreply@petlinkid.com>',
      to: [user.email],
      subject: getSubject(email_action_type),
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log(`Successfully sent ${email_action_type} email to ${user.email}`);
    
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in send-auth-email function:', error);
    return new Response(
      JSON.stringify({ error: { http_code: 500, message } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

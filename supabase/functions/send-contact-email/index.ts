import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Zod schema for input validation
const ContactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50).trim(),
  lastName: z.string().min(1, "Last name is required").max(50).trim(),
  email: z.string().email("Invalid email format").max(255).toLowerCase(),
  subject: z.string().min(1, "Subject is required").max(200).trim(),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000).trim(),
});

// Escape HTML to prevent XSS attacks in email clients
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const validation = ContactFormSchema.safeParse(body);
    
    if (!validation.success) {
      console.error("Validation failed:", validation.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid input data", details: validation.error.errors }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { firstName, lastName, email, subject, message } = validation.data;

    console.log("Received validated contact form submission");

    // Sanitize all user inputs before using in HTML
    const safeFirstName = escapeHtml(firstName);
    const safeLastName = escapeHtml(lastName);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

    // Send email to support inbox
    const emailResponse = await resend.emails.send({
      from: "PetLinkID Support <support@petlinkid.io>",
      to: ["support@petlinkid.io"],
      replyTo: email,
      subject: `Contact Form: ${safeSubject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${safeFirstName} ${safeLastName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <hr />
        <h3>Message:</h3>
        <p>${safeMessage}</p>
      `,
    });

    console.log("Email sent successfully");
    if ((emailResponse as any)?.error) {
      console.error("Resend support email error:", (emailResponse as any).error);
      throw new Error((emailResponse as any).error.message || "Failed to send support email");
    }

    // Send confirmation email to user
    await resend.emails.send({
      from: "PetLinkID Support <support@petlinkid.io>",
      to: [email],
      subject: "We received your message!",
      html: `
        <h1>Thank you for contacting us, ${safeFirstName}!</h1>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <p><strong>Your message:</strong></p>
        <p>${safeMessage}</p>
        <hr />
        <p>Best regards,<br>The PetLinkID Team</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

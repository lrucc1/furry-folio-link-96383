import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { buildCors, isAllowedOrigin } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = buildCors(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Validate origin
  const origin = req.headers.get('origin') ?? '';
  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;

    const user = userData.user;
    if (!user) throw new Error("User not found");

    const { consentTypes, version = 'v1.0' } = await req.json();

    // Get IP and user agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Record consents
    const consents = consentTypes.map((type: string) => ({
      user_id: user.id,
      consent_type: type,
      ip_address: ip,
      user_agent: userAgent,
      version,
    }));

    const { error: insertError } = await supabaseClient
      .from('legal_consents')
      .insert(consents);

    if (insertError) throw insertError;

    console.log(`[TRACK-CONSENT] Recorded ${consents.length} consents for user ${user.id}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });

  } catch (error) {
    const corsHeaders = buildCors(req);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[TRACK-CONSENT] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: corsHeaders,
      status: 500,
    });
  }
});

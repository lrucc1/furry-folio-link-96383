import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const PublicPetSchema = z.object({
  public_token: z.string().uuid({ message: "public_token must be a UUID" }),
});

const MAX_LOOKUPS_PER_MINUTE = 30;

const getClientIp = (req: Request): string | null => {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    null
  );
};

const enforceRateLimit = async (supabase: ReturnType<typeof createClient>, ip: string | null) => {
  if (!ip) return null;

  const windowStart = new Date(Math.floor(Date.now() / 60000) * 60000).toISOString();
  const { data: existing, error } = await supabase
    .from("public_pet_lookup_limits")
    .select("request_count")
    .eq("ip_address", ip)
    .eq("window_start", windowStart)
    .maybeSingle();

  if (error) {
    console.warn("[public-pet-contact] Rate limit lookup failed:", error.message);
    return null;
  }

  if (existing && existing.request_count >= MAX_LOOKUPS_PER_MINUTE) {
    return new Response(
      JSON.stringify({ error: "Too many lookup attempts. Please try again later." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
    );
  }

  if (existing) {
    await supabase
      .from("public_pet_lookup_limits")
      .update({
        request_count: existing.request_count + 1,
        last_seen_at: new Date().toISOString(),
      })
      .eq("ip_address", ip)
      .eq("window_start", windowStart);
  } else {
    await supabase.from("public_pet_lookup_limits").insert({
      ip_address: ip,
      window_start: windowStart,
      request_count: 1,
      last_seen_at: new Date().toISOString(),
    });
  }

  return null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json();
    
    const rateLimitResponse = await enforceRateLimit(supabase, getClientIp(req));
    if (rateLimitResponse) return rateLimitResponse;

    // Validate input
    const validation = PublicPetSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      console.error('[public-pet-contact] Validation error:', errors);
      return new Response(
        JSON.stringify({ error: "Invalid input data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { public_token } = validation.data;

    // Fetch pet by public_id
    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("id, name, species, breed, color, date_of_birth, photo_url, is_lost, microchip_number, user_id, emergency_contact_name, emergency_contact_phone")
      .eq("public_token", public_token)
      .single();

    if (petError || !pet) {
      return new Response(
        JSON.stringify({ error: "Pet not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    const isLost = pet.is_lost === true;

    // Fetch owner profile only for lost pets
    let owner = null as null | { full_name: string | null; email: string | null; phone: string | null };

    if (isLost && pet.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", pet.user_id)
        .single();

      if (profile) {
        owner = {
          full_name: profile.full_name ?? null,
          email: profile.email ?? null,
          phone: profile.phone ?? null,
        };
      }
    }

    return new Response(
      JSON.stringify({
        pet: { 
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed ?? null,
          colour: pet.color ?? null,
          date_of_birth: pet.date_of_birth ?? null,
          photo_url: pet.photo_url ?? null,
          is_lost: pet.is_lost,
          microchip_number: isLost ? pet.microchip_number ?? null : null,
        },
        owner,
        emergency_contact: {
          name: isLost ? pet.emergency_contact_name ?? null : null,
          phone: isLost ? pet.emergency_contact_phone ?? null : null,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    console.error("[public-pet-contact] Error:", err);
    return new Response(
      JSON.stringify({ error: "Unable to retrieve pet information" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

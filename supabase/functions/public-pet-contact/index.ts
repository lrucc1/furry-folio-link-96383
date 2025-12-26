import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const PublicPetSchema = z.object({
  public_token: z.string().uuid({ message: "public_token must be a UUID" }),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 10;

// In-memory rate limit store (resets on function cold start, but provides basic protection)
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

const checkRateLimit = (ip: string): { allowed: boolean; remaining: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    // New window
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
};

const getClientIp = (req: Request): string => {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
         req.headers.get("x-real-ip") ||
         "unknown";
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Rate limiting check
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(clientIp);
    
    if (!rateLimitResult.allowed) {
      console.warn(`[public-pet-contact] Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "3600"
          }, 
          status: 429 
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const body = await req.json();

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

    // Log lookup for audit purposes
    console.log(`[public-pet-contact] Lookup request for token: ${public_token.substring(0, 8)}... from IP: ${clientIp}`);

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
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": rateLimitResult.remaining.toString()
        }, 
        status: 200 
      }
    );
  } catch (err) {
    console.error("[public-pet-contact] Error:", err);
    return new Response(
      JSON.stringify({ error: "Unable to retrieve pet information" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

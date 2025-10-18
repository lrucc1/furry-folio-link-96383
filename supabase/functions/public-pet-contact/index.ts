import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

    const { public_id } = await req.json();
    if (!public_id) {
      return new Response(
        JSON.stringify({ error: "public_id is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Fetch pet by public_id (public policy allows this)
    const { data: pet, error: petError } = await supabase
      .from("pets")
      .select("id, name, is_lost, user_id, emergency_contact_name, emergency_contact_phone")
      .eq("public_id", public_id)
      .single();

    if (petError || !pet) {
      return new Response(
        JSON.stringify({ error: "Pet not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Fetch owner profile (always, regardless of lost status)
    let owner = null as null | { full_name: string | null; email: string | null; phone: string | null };

    if (pet.user_id) {
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
        pet: { name: pet.name },
        owner,
        emergency_contact: {
          name: pet.emergency_contact_name ?? null,
          phone: pet.emergency_contact_phone ?? null,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    console.error("[public-pet-contact] Error:", err);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(status: number, body: Record<string, any>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })

    const { data: authData, error: authErr } = await supabase.auth.getUser()
    if (authErr || !authData?.user) {
      return jsonResponse(401, { error: 'not_authenticated', message: 'Sign in required.' })
    }

    const userId = authData.user.id
    const payload = await req.json()

    // Minimal server-side validation
    const name = String(payload?.name ?? '').trim()
    const species = String(payload?.species ?? '').trim()
    if (!name || !species) {
      return jsonResponse(400, { error: 'validation_error', message: 'Name and species are required.' })
    }
    if (name.length > 100 || species.length > 50) {
      return jsonResponse(400, { error: 'validation_error', message: 'Field length exceeded.' })
    }

    // Map and whitelist only columns that exist in public.pets schema
    const insertData: Record<string, any> = {
      user_id: userId,
      name,
      species,
      // Basic profile
      breed: payload?.breed ?? null,
      color: payload?.color ?? null,
      gender: (payload?.gender ?? payload?.sex) ?? null,
      date_of_birth: payload?.date_of_birth ?? null,
      microchip_number: payload?.microchip_number ?? null,
      notes: payload?.notes ?? null,

      // Optional known columns in current schema (ignored if not provided)
      age_years: payload?.age_years ?? null,
      age_months: payload?.age_months ?? null,
      weight_kg: payload?.weight_kg ?? null,
      medical_conditions: payload?.medical_conditions ?? null,
      medications: payload?.medications ?? null,
      allergies: payload?.allergies ?? null,
      photo_url: payload?.photo_url ?? null,
      status: payload?.status ?? null,

      // Vet & emergency contacts (map older field names when present)
      vet_name: payload?.vet_name ?? payload?.clinic_name ?? null,
      vet_phone: payload?.vet_phone ?? null,
      vet_email: payload?.vet_email ?? null,
      emergency_contact_name: payload?.emergency_contact_name ?? null,
      emergency_contact_phone: payload?.emergency_contact_phone ?? null,
    }

    // Log for debugging (keys only, not full payload)
    console.log('[create-pet] user:', userId)
    console.log('[create-pet] payload keys:', Object.keys(payload || {}))
    console.log('[create-pet] insertData keys:', Object.keys(insertData))

    const { data, error } = await supabase
      .from('pets')
      .insert([insertData])
      .select('id')
      .single()

    if (error) {
      console.error('[create-pet] insert error:', error)
      // Return safe but helpful error details
      return jsonResponse(400, { 
        error: 'insert_failed', 
        message: error.message || 'Insert failed.',
        code: (error as any).code ?? undefined,
      })
    }

    return jsonResponse(200, { id: data?.id })
  } catch (e) {
    return jsonResponse(500, { error: 'server_error', message: 'Unexpected error.' })
  }
})

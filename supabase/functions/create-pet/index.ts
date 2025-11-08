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
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })

    const { data: authData, error: authErr } = await supabase.auth.getUser()
    if (authErr || !authData?.user) {
      return jsonResponse(401, { error: 'not_authenticated', message: 'Sign in required.' })
    }

    const userId = authData.user.id
    const payload = await req.json()

    // Helpers to sanitize optional inputs
    const str = (v: any, max?: number) => {
      if (v === undefined || v === null) return null
      const s = String(v).trim()
      if (!s) return null
      return max ? s.slice(0, max) : s
    }
    const num = (v: any) => {
      if (v === undefined || v === null || v === '') return null
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    }
    const int = (v: any) => {
      if (v === undefined || v === null || v === '') return null
      const n = parseInt(v, 10)
      return Number.isFinite(n) ? n : null
    }
    const date = (v: any) => {
      if (v === undefined || v === null) return null
      const s = String(v).trim()
      return s ? s : null // Expecting YYYY-MM-DD; DB will validate
    }

    // Minimal server-side validation
    const name = str(payload?.name, 100)
    const species = str(payload?.species, 50)
    if (!name || !species) {
      return jsonResponse(400, { error: 'validation_error', message: 'Name and species are required.' })
    }

    // Map and whitelist only columns that exist in public.pets schema, coercing empty strings to null
    const insertData: Record<string, any> = {
      user_id: userId,
      name,
      species,

      // Basic profile
      breed: str(payload?.breed),
      color: str(payload?.color),
      gender: str(payload?.gender ?? payload?.sex),
      date_of_birth: date(payload?.date_of_birth),
      microchip_number: str(payload?.microchip_number),
      notes: str(payload?.notes, 10000),

      // Numbers & flags
      age_years: int(payload?.age_years),
      age_months: int(payload?.age_months),
      weight_kg: num(payload?.weight_kg),
      desexed: typeof payload?.desexed === 'boolean' ? payload.desexed : null,
      is_lost: typeof payload?.is_lost === 'boolean' ? payload.is_lost : null,
      clinic_lat: num(payload?.clinic_lat),
      clinic_lng: num(payload?.clinic_lng),

      // Health & media
      medical_conditions: str(payload?.medical_conditions),
      medications: str(payload?.medications),
      allergies: str(payload?.allergies),
      photo_url: str(payload?.photo_url),
      status: str(payload?.status),

      // Vet & emergency contacts (map older field names when present)
      vet_name: str(payload?.vet_name ?? payload?.clinic_name),
      vet_phone: str(payload?.vet_phone),
      vet_email: str(payload?.vet_email),
      emergency_contact_name: str(payload?.emergency_contact_name),
      emergency_contact_phone: str(payload?.emergency_contact_phone),

      // Registry & insurance
      registry_name: str(payload?.registry_name),
      registry_link: str(payload?.registry_link),
      insurance_provider: str(payload?.insurance_provider),
      insurance_policy: str(payload?.insurance_policy),

      // Clinic address extras present in current schema
      clinic_name: str(payload?.clinic_name),
      clinic_address: str(payload?.clinic_address),
      clinic_suburb: str(payload?.clinic_suburb),
      clinic_state: str(payload?.clinic_state),
      clinic_postcode: str(payload?.clinic_postcode),
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
      return jsonResponse(400, {
        error: 'insert_failed',
        message: (error as any).message || 'Insert failed.',
        code: (error as any).code ?? undefined,
        details: (error as any).details ?? undefined,
        hint: (error as any).hint ?? undefined,
      })
    }

    return jsonResponse(200, { id: data?.id })
  } catch (e) {
    return jsonResponse(500, { error: 'server_error', message: 'Unexpected error.' })
  }
})

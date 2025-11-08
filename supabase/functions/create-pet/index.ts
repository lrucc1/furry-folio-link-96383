import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0)

const resolveOrigin = (requestOrigin?: string) => {
  if (!allowedOrigins.length || allowedOrigins.includes('*')) {
    return '*'
  }

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin
  }

  return allowedOrigins[0]
}

const getCorsHeaders = (origin?: string) => ({
  'Access-Control-Allow-Origin': resolveOrigin(origin),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
})

function json(body: Record<string, unknown>, status = 200, origin?: string) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...getCorsHeaders(origin) },
  })
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin') ?? undefined

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(origin) })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceKey) {
      console.error('[create-pet] Missing Supabase environment variables')
      return json({ error: 'server_error', message: 'Configuration error.' }, 500, origin)
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    })

    const authHeader = req.headers.get('Authorization') ?? ''
    const jwt = authHeader.replace('Bearer ', '').trim()

    if (!jwt) {
      return json({ error: 'Unauthenticated' }, 401, origin)
    }

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser(jwt)

    if (userErr || !user) {
      console.error('[create-pet] Auth error:', userErr)
      return json({ error: 'Unauthenticated' }, 401, origin)
    }

    let rawBody: unknown
    try {
      rawBody = await req.json()
    } catch (error) {
      console.error('[create-pet] Invalid JSON:', error)
      return json({ error: 'Invalid JSON' }, 400, origin)
    }

    if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
      return json({ error: 'Invalid JSON' }, 400, origin)
    }

    const payload = rawBody as Record<string, unknown>
    const fromPayload = (key: string) => payload[key]

    const str = (value: unknown, max?: number) => {
      if (value === undefined || value === null) return null
      const s = String(value).trim()
      if (!s) return null
      return max ? s.slice(0, max) : s
    }
    const num = (value: unknown) => {
      if (value === undefined || value === null || value === '') return null
      const n = Number(value)
      return Number.isFinite(n) ? n : null
    }
    const int = (value: unknown) => {
      if (value === undefined || value === null || value === '') return null
      const n = parseInt(String(value), 10)
      return Number.isFinite(n) ? n : null
    }
    const date = (value: unknown) => {
      if (value === undefined || value === null) return null
      const s = String(value).trim()
      return s ? s : null
    }
    const bool = (value: unknown) => (typeof value === 'boolean' ? value : null)

    const name = str(fromPayload('name'), 100)
    const species = str(fromPayload('species'), 50)

    if (!name || !species) {
      const missing = !name ? 'name' : 'species'
      return json({ error: `Missing field: ${missing}` }, 400, origin)
    }

    const insertData: Record<string, unknown> = {
      user_id: user.id,
      name,
      species,
      breed: str(fromPayload('breed')),
      color: str(fromPayload('color')),
      gender: str(fromPayload('gender') ?? fromPayload('sex')),
      date_of_birth: date(fromPayload('date_of_birth') ?? fromPayload('dob')),
      microchip_number: str(fromPayload('microchip_number') ?? fromPayload('microchip')),
      notes: str(fromPayload('notes'), 10000),
      age_years: int(fromPayload('age_years')),
      age_months: int(fromPayload('age_months')),
      weight_kg: num(fromPayload('weight_kg')),
      desexed: bool(fromPayload('desexed')),
      is_lost: bool(fromPayload('is_lost')),
      clinic_lat: num(fromPayload('clinic_lat')),
      clinic_lng: num(fromPayload('clinic_lng')),
      medical_conditions: str(fromPayload('medical_conditions')),
      medications: str(fromPayload('medications')),
      allergies: str(fromPayload('allergies')),
      photo_url: str(fromPayload('photo_url')),
      status: str(fromPayload('status')),
      vet_name: str(fromPayload('vet_name') ?? fromPayload('clinic_name')),
      vet_phone: str(fromPayload('vet_phone')),
      vet_email: str(fromPayload('vet_email')),
      emergency_contact_name: str(fromPayload('emergency_contact_name')),
      emergency_contact_phone: str(fromPayload('emergency_contact_phone')),
      registry_name: str(fromPayload('registry_name')),
      registry_link: str(fromPayload('registry_link')),
      insurance_provider: str(fromPayload('insurance_provider')),
      insurance_policy: str(fromPayload('insurance_policy')),
      clinic_name: str(fromPayload('clinic_name')),
      clinic_address: str(fromPayload('clinic_address')),
      clinic_suburb: str(fromPayload('clinic_suburb')),
      clinic_state: str(fromPayload('clinic_state')),
      clinic_postcode: str(fromPayload('clinic_postcode')),
    }

    console.log('[create-pet] user:', user.id)
    console.log('[create-pet] payload keys:', Object.keys(payload))

    const { data: inserted, error: dbErr } = await supabase
      .from('pets')
      .insert([insertData])
      .select('id')
      .single()

    if (dbErr) {
      console.error('[create-pet] insert error:', dbErr)
      return json({ error: dbErr.message ?? 'Insert failed.' }, 400, origin)
    }

    if (!inserted) {
      console.error('[create-pet] Insert returned no data')
      return json({ error: 'Insert failed.' }, 500, origin)
    }

    return json({ id: inserted.id }, 201, origin)
  } catch (error) {
    console.error('[create-pet] Unexpected error:', error)
    return json({ error: 'server_error', message: 'Unexpected error.' }, 500, origin)
  }
})

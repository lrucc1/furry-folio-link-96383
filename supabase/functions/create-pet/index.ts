import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'
import { buildCors, isAllowedOrigin } from '../_shared/cors.ts'

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: buildCors(req),
  })
}

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Validate origin
  const origin = req.headers.get('origin') ?? '';
  if (!isAllowedOrigin(origin)) {
    console.error('[create-pet] Forbidden origin:', origin);
    return json(req, { error: 'Forbidden' }, 403);
  }

  if (req.method !== 'POST') {
    return json(req, { error: 'Method not allowed' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceKey) {
      console.error('[create-pet] Missing Supabase environment variables')
      return json(req, { error: 'Configuration error' }, 500)
    }

    // Use SERVICE_ROLE_KEY to bypass RLS
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    })

    // Verify user from JWT
    const authHeader = req.headers.get('Authorization') ?? ''
    const jwt = authHeader.replace('Bearer ', '').trim()

    if (!jwt) {
      console.error('[create-pet] No JWT provided')
      return json(req, { error: 'Unauthenticated' }, 401)
    }

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser(jwt)

    if (userErr || !user) {
      console.error('[create-pet] Auth error:', userErr)
      return json(req, { error: 'Unauthenticated' }, 401)
    }

    // Parse and validate body
    let body: any
    try {
      body = await req.json()
    } catch {
      console.error('[create-pet] Invalid JSON')
      return json(req, { error: 'Invalid JSON' }, 400)
    }

    // Validate required fields
    const required = ['name', 'species']
    for (const k of required) {
      if (!body[k] || typeof body[k] !== 'string' || !body[k].trim()) {
        console.error(`[create-pet] Missing required field: ${k}`)
        return json(req, { error: `Missing field: ${k}` }, 400)
      }
    }

    // Insert into database (service role bypasses RLS)
    const { data, error: dbErr } = await supabase
      .from('pets')
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        species: body.species.trim(),
        breed: body.breed?.trim() || null,
        color: body.color?.trim() || null,
        gender: body.sex?.trim() || body.gender?.trim() || null,
        date_of_birth: body.dob || body.date_of_birth || null,
        microchip_number: body.microchip || body.microchip_number || null,
        notes: body.notes?.trim() || null,
        registry_name: body.registry_name?.trim() || null,
        registry_link: body.registry_link?.trim() || null,
        clinic_name: body.clinic_name?.trim() || null,
        clinic_address: body.clinic_address?.trim() || null,
        insurance_provider: body.insurance_provider?.trim() || null,
        insurance_policy: body.insurance_policy?.trim() || null,
        desexed: body.desexed || false,
        weight_kg: body.weight_kg || null,
        photo_url: body.photo_url?.trim() || null,
      })
      .select('id')
      .single()

    if (dbErr) {
      console.error('[create-pet] Database error:', dbErr)
      return json(req, { error: dbErr.message || 'Failed to create pet' }, 400)
    }

    if (!data?.id) {
      console.error('[create-pet] No ID returned')
      return json(req, { error: 'Pet creation failed' }, 500)
    }

    console.log('[create-pet] Success - pet ID:', data.id)
    return json(req, { id: data.id }, 201)
  } catch (error) {
    console.error('[create-pet] Unexpected error:', error)
    return json(req, { error: 'Unexpected server error' }, 500)
  }
})

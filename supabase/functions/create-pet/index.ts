import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGINS') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceKey) {
      console.error('[create-pet] Missing Supabase environment variables')
      return json({ error: 'Configuration error' }, 500)
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
      return json({ error: 'Unauthenticated' }, 401)
    }

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser(jwt)

    if (userErr || !user) {
      console.error('[create-pet] Auth error:', userErr)
      return json({ error: 'Unauthenticated' }, 401)
    }

    // Parse and validate body
    let body: any
    try {
      body = await req.json()
    } catch {
      console.error('[create-pet] Invalid JSON')
      return json({ error: 'Invalid JSON' }, 400)
    }

    // Validate required fields
    const required = ['name', 'species']
    for (const k of required) {
      if (!body[k] || typeof body[k] !== 'string' || !body[k].trim()) {
        console.error(`[create-pet] Missing required field: ${k}`)
        return json({ error: `Missing field: ${k}` }, 400)
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
      })
      .select('id')
      .single()

    if (dbErr) {
      console.error('[create-pet] Database error:', dbErr)
      return json({ error: dbErr.message || 'Failed to create pet' }, 400)
    }

    if (!data?.id) {
      console.error('[create-pet] No ID returned')
      return json({ error: 'Pet creation failed' }, 500)
    }

    console.log('[create-pet] Success - pet ID:', data.id)
    return json({ id: data.id }, 201)
  } catch (error) {
    console.error('[create-pet] Unexpected error:', error)
    return json({ error: 'Unexpected server error' }, 500)
  }
})

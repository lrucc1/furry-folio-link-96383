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

    const insertData: Record<string, any> = {
      user_id: userId,
      name,
      species,
      breed: payload?.breed || null,
      color: payload?.color || null,
      gender: payload?.sex || null,
      date_of_birth: payload?.date_of_birth || null,
      microchip_number: payload?.microchip_number || null,
      registry_name: payload?.registry_name || null,
      registry_link: payload?.registry_link || null,
      clinic_name: payload?.clinic_name || null,
      clinic_address: payload?.clinic_address || null,
      insurance_provider: payload?.insurance_provider || null,
      insurance_policy: payload?.insurance_policy || null,
      notes: payload?.notes || null,
    }

    const { data, error } = await supabase
      .from('pets')
      .insert([insertData])
      .select('id')
      .single()

    if (error) {
      // Return safe error details only
      return jsonResponse(403, { error: 'insert_failed', message: 'Permission denied or policy blocked insert.' })
    }

    return jsonResponse(200, { id: data?.id })
  } catch (e) {
    return jsonResponse(500, { error: 'server_error', message: 'Unexpected error.' })
  }
})

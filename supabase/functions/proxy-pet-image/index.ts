import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    console.log('[proxy-pet-image] Received request for URL:', url)
    
    // Validate URL is from our Supabase storage
    if (!url || typeof url !== 'string') {
      console.error('[proxy-pet-image] Invalid URL: missing or not a string')
      return new Response(
        JSON.stringify({ error: 'Invalid URL parameter' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!url.includes('supabase.co/storage')) {
      console.error('[proxy-pet-image] Invalid URL: not from Supabase storage')
      return new Response(
        JSON.stringify({ error: 'Only Supabase storage URLs are allowed' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[proxy-pet-image] Fetching image...')
    
    // Fetch the image
    const imageResponse = await fetch(url)
    
    if (!imageResponse.ok) {
      console.error('[proxy-pet-image] Failed to fetch image:', imageResponse.status)
      return new Response(
        JSON.stringify({ error: `Failed to fetch image: ${imageResponse.status}` }), 
        { status: imageResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const imageBlob = await imageResponse.blob()
    const arrayBuffer = await imageBlob.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Convert to base64 in chunks to avoid call stack issues with large images
    let binary = ''
    const chunkSize = 8192
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize)
      binary += String.fromCharCode.apply(null, Array.from(chunk))
    }
    const base64 = btoa(binary)
    
    console.log('[proxy-pet-image] Successfully converted image to base64, size:', base64.length)

    return new Response(
      JSON.stringify({ 
        base64, 
        contentType: imageBlob.type || 'image/jpeg' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[proxy-pet-image] Error:', errorMessage)
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

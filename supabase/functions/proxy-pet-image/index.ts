import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Extract storage path from URL or return as-is if already a path
 */
function extractStoragePath(urlOrPath: string): string {
  if (!urlOrPath) return '';
  
  // If it's already a relative path, return as-is
  if (!urlOrPath.startsWith('http://') && !urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }
  
  // Extract path from full Supabase URL
  const match = urlOrPath.match(/\/storage\/v1\/object\/(?:public|sign)\/pet-documents\/(.+?)(?:\?|$)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }
  
  // Fallback: try to extract just the filename with user-id prefix
  const parts = urlOrPath.split('/');
  const lastTwo = parts.slice(-2);
  if (lastTwo.length === 2 && lastTwo[0].includes('-')) {
    return `${lastTwo[0]}/${lastTwo[1].split('?')[0]}`;
  }
  
  return parts[parts.length - 1].split('?')[0];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { url, storagePath } = await req.json()
    
    // Support both legacy 'url' parameter and new 'storagePath' parameter
    const inputPath = storagePath || url;
    
    console.log('[proxy-pet-image] Received proxy request')
    
    if (!inputPath || typeof inputPath !== 'string') {
      console.error('[proxy-pet-image] Invalid input: missing or not a string')
      return new Response(
        JSON.stringify({ error: 'Invalid URL or storage path parameter' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract the actual storage path
    const actualPath = extractStoragePath(inputPath);
    
    if (!actualPath) {
      console.error('[proxy-pet-image] Could not extract storage path from input')
      return new Response(
        JSON.stringify({ error: 'Could not determine storage path' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[proxy-pet-image] Resolved storage path')

    // Create Supabase client with service role for private bucket access
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Generate signed URL for the private bucket
    const { data: signedData, error: signedError } = await supabase.storage
      .from('pet-documents')
      .createSignedUrl(actualPath, 3600); // 1 hour expiry

    if (signedError || !signedData?.signedUrl) {
      console.error('[proxy-pet-image] Failed to generate signed URL:', signedError)
      return new Response(
        JSON.stringify({ error: 'Failed to access image' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[proxy-pet-image] Generated signed URL, fetching image...')
    
    // Fetch the image using the signed URL
    const imageResponse = await fetch(signedData.signedUrl)
    
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
    
    console.log('[proxy-pet-image] Successfully converted image to base64')

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

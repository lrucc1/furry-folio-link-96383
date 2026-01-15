import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Input validation schema
const SmartTagInterestSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  name: z.string().max(100).optional().nullable(),
  likelihood: z.number().int().min(1).max(5),
  features: z.array(z.string().max(50)).max(10).optional().nullable(),
  comments: z.string().max(2000).optional().nullable(),
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
      console.warn(`[submit-smart-tag-interest] Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
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

    const body = await req.json();

    // Validate input
    const validation = SmartTagInterestSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      console.error('[submit-smart-tag-interest] Validation error:', errors);
      return new Response(
        JSON.stringify({ error: "Invalid input data", details: errors }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { email, name, likelihood, features, comments } = validation.data;

    console.log('[submit-smart-tag-interest] New smart tag interest submission received');

    // Use service role to bypass RLS for insert
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await supabase
      .from("smart_tag_interest")
      .insert({
        email,
        name: name || null,
        likelihood,
        features: features && features.length > 0 ? features : null,
        comments: comments || null,
      });

    if (insertError) {
      console.error('[submit-smart-tag-interest] Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save your interest. Please try again." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Thanks for your interest!" }),
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
    console.error("[submit-smart-tag-interest] Error:", err);
    return new Response(
      JSON.stringify({ error: "Unable to process your request" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

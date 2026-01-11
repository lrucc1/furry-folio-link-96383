// Allowed origins for CORS - explicit allowlist for security
const ALLOWED_ORIGINS = new Set([
  'https://petlinkid.io',
  'https://www.petlinkid.io',
  'https://petlinkid.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
]);

/**
 * Check if an origin is allowed for CORS
 * Allows explicit origins + any *.lovable.app or *.lovableproject.com subdomain
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    const host = url.hostname;
    // Check explicit allowlist
    if (ALLOWED_ORIGINS.has(origin)) return true;
    // Allow Lovable preview/deploy subdomains
    if (host.endsWith('.lovable.app')) return true;
    if (host.endsWith('.lovableproject.com')) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Build CORS headers for a request
 * Returns secure headers with explicit origin validation
 */
export const buildCors = (req: Request) => {
  const origin = req.headers.get('origin') ?? req.headers.get('referer');
  let allowedOrigin = 'https://petlinkid.io'; // Default fallback
  
  if (origin) {
    try {
      const parsedOrigin = new URL(origin).origin;
      if (isAllowedOrigin(parsedOrigin)) {
        allowedOrigin = parsedOrigin;
      }
    } catch {
      // Invalid origin, use default
    }
  }
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
  } as Record<string, string>;
};

/**
 * Helper to return JSON response with CORS headers
 */
export const json = (req: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: buildCors(req) });

/**
 * Check origin and return forbidden response if not allowed
 * Use this for strict origin enforcement
 */
export function checkOrigin(req: Request): { allowed: boolean; headers: Record<string, string> } {
  const origin = req.headers.get('origin') ?? '';
  const allowed = isAllowedOrigin(origin);
  return {
    allowed,
    headers: {
      'Access-Control-Allow-Origin': allowed ? origin : 'https://petlinkid.io',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Vary': 'Origin',
    },
  };
}

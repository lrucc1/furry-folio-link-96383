export const buildCors = (req: Request) => {
  // Allow the exact origin when available, else *
  let origin = '*';
  const hdr = req.headers.get('origin') ?? req.headers.get('referer');
  try { if (hdr) origin = new URL(hdr).origin; } catch {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Content-Type': 'application/json',
  } as Record<string,string>;
};

export const json = (req: Request, body: any, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: buildCors(req) });

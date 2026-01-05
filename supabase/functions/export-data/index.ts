import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const ALLOWED_ORIGINS = new Set([
  'https://petlinkid.io',
  'https://www.petlinkid.io',
  'https://petlinkid.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080'
]);

function cors(origin: string) {
  const allowed = ALLOWED_ORIGINS.has(origin);
  return {
    allowed,
    headers: {
      'Access-Control-Allow-Origin': allowed ? origin : 'https://petlinkid.io',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'GET,OPTIONS'
    }
  };
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[EXPORT-DATA] ${step}${detailsStr}`);
};

serve(async (req) => {
  const origin = req.headers.get('origin') ?? '';
  const c = cors(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: c.headers });
  }
  
  if (!c.allowed) {
    return new Response('Forbidden', { status: 403, headers: c.headers });
  }

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...c.headers, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      logStep("ERROR: User authentication failed", { error: userError });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...c.headers, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;
    logStep("User authenticated", { userId });

    // Prepare export data
    const exportData: any = {
      user: {
        id: userId,
        email: userEmail,
        exported_at: new Date().toISOString()
      },
      data: {}
    };

    // Query user data from various tables
    const tables = [
      'pets',
      'health_reminders', 
      'pet_documents',
      'vaccinations',
      'notifications',
      'profiles'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabaseClient
          .from(table)
          .select('*')
          .eq(table === 'profiles' ? 'id' : 'user_id', userId);
        
        if (!error && data) {
          exportData.data[table] = data;
          logStep(`Exported ${data.length} records from ${table}`);
        }
      } catch (err) {
        logStep(`Warning: Could not export from ${table}`, { error: err });
      }
    }

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: { 
        ...c.headers, 
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=petlinkid-export.json"
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in export-data", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...c.headers, "Content-Type": "application/json" },
    });
  }
});

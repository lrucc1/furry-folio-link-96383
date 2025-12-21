import { makeServiceClient } from "../_shared/clients.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = makeServiceClient();
    
    console.log("Admin testing reminder email system");

    // Call the send-reminder-emails function
    const cronSecret = Deno.env.get("CRON_SECRET");
    const { data, error } = await supabase.functions.invoke('send-reminder-emails', {
      body: {},
      headers: cronSecret ? { "x-cron-secret": cronSecret } : undefined,
    });

    if (error) {
      console.error("Error invoking send-reminder-emails:", error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Reminder email test completed:", data);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Test email send triggered successfully",
        results: data
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in test-reminder-emails:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

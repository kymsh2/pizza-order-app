import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-api-key, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

serve(async (req) => {

 if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // authenticate
  const apiKey = req.headers.get('x-api-key');
  console.log("apiKey: " + apiKey)
  if (apiKey !== Deno.env.get('KITCHEN_APP_API_KEY')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 , headers: corsHeaders }
    );
  }
  
  try {
    const body = await req.json();
    console.log("body:" + body);
    const { expo_push_token, device_name, platform } = body;

    if (!expo_push_token) {
      return new Response(JSON.stringify({ error: "Token required" }), { status: 400 });
    }

    // Upsert token
    const { data, error } = await supabase
      .from("push_tokens")
      .upsert({
        expo_push_token,
        device_name: device_name || null,
        platform: platform || null,
        last_seen_at: new Date().toISOString(),
      }, { onConflict: ["expo_push_token"] });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
    });
  } catch (err) {
    console.error("Failed to save token:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

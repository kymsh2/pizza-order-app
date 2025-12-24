import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

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

  // Only GET allowed
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405 , headers: corsHeaders }
      );
    }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const body = await req.json();
  const { order_id } = body;


  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "COMPLETED",
      completed_at: new Date().toISOString(),
    })
    .eq("id", order_id)
    .eq("status", "ACCEPTED") // safety guard
    .select('id');

  if (error) {
    console.error('complete_order error:', error);
    return new Response(JSON.stringify({ error }),  { status: 500 , headers: corsHeaders });
  }

  return new Response(JSON.stringify({ success: true , recordUpdated: data?.length ?? 0}),
   { status: 200 , headers: corsHeaders });
});

import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
  'authorization, x-api-key, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {

   if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  // authenticate
  const apiKey = req.headers.get('x-api-key');

  if (apiKey !== Deno.env.get('KITCHEN_APP_API_KEY')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401 , headers: corsHeaders }
    );
  }

  try {
    // Only POST allowed
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405 , headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { order_id, prep_minutes } = body;

    // Validate input
    if (!order_id || typeof prep_minutes !== 'number') {
      return new Response(
        JSON.stringify({ error: 'order_id and prep_minutes required' }),
        { status: 400 , headers: corsHeaders }
      );
    }

    if (prep_minutes < 5 || prep_minutes > 240) {
      return new Response(
        JSON.stringify({ error: 'prep_minutes must be between 5 and 240' }),
        { status: 400 , headers: corsHeaders }
      );
    }

    // Create Supabase client (service role)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch current order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', order_id)
      .single();

    if (fetchError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404 , headers: corsHeaders }
      );
    }

    // Only allow NEW orders
    if (order.status !== 'NEW') {
      return new Response(
        JSON.stringify({ error: `Order already ${order.status}` }),
        { status: 409  , headers: corsHeaders}
      );
    }

    // Accept order
    const now = new Date().toISOString();

    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'ACCEPTED',
        accepted_at: now,
        prep_minutes,
        pickup_at: new Date(
          Date.now() + prep_minutes * 60 * 1000
        ).toISOString()
      })
      .eq('id', order_id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, order: updatedOrder }),
      { status: 200 , headers: corsHeaders }
    );

  } catch (err) {
    console.error('accept_order error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 , headers: corsHeaders}
    );
  }
});

import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.0";

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
    // Only GET allowed
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405 , headers: corsHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch active orders
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        wc_order_id,
        status,
        created_at,
        accepted_at,
        completed_at,
        pickup_at,
        prep_minutes,
        total,
        total_tax,
        payment_method,
        order_notes,
        first_order,
        discount_total,
        discount_tax,
        customers (
          name,
          phone,
          email,
          address
        ),
        order_items (
          product_id,
          variation_id,
          name,
          quantity,
          price,
          variation_id,
          total, 
          total_tax,
          size
        )
      `)
      // .in('status', ['NEW', 'ACCEPTED'])
      .order('pickup_at', { ascending: true, nullsFirst: true });

    if (error) {
      console.error('Fetch orders error:', error);
      throw error;
    }

    // Add remaining time
    const now = Date.now();

    // const response = orders.map(order => {
    //   let remaining_seconds = null;

    //   if (order.pickup_at) {
    //     remaining_seconds = Math.max(
    //       0,
    //       Math.floor(
    //         (new Date(order.pickup_at).getTime() - now) / 1000
    //       )
    //     );
    //   }

    //   return {
    //     ...order,
    //     remaining_seconds
    //   };
    // });

     /** */
     const response = orders.map(order => {
      let remaining_seconds = null;

      if (order.pickup_at) {
        remaining_seconds = Math.max(
          0,
          Math.floor(
            (new Date(order.pickup_at).getTime() - now) / 1000
          )
        );
      }

      return {
        id: order.id,
        wc_order_id: order.wc_order_id,
        status: order.status,
        created_at: order.created_at,
        accepted_at: order.accepted_at ?? null,
        completed_at: order.completed_at ?? null,
        pickup_at: order.pickup_at ?? null,
        prep_minutes: order.prep_minutes ?? null,
        remaining_seconds,
        total: order.total,        
  
        total_tax: order.total_tax,
        payment_method: order.payment_method,
        order_notes: order.order_notes,
        first_order: order.first_order,
        discount_total: order.discount_total,
        discount_tax: order.discount_tax,

        customer: order.customers,
        items: order.order_items,

        // INTERNAL ONLY (for sorting)
        _status_priority: STATUS_PRIORITY[order.status] ?? 99,
        _sort_time: getSortTime(order)
      };
    })
    .sort((a, b) => {
    // 1️⃣ Status priority
    if (a._status_priority !== b._status_priority) {
      return a._status_priority - b._status_priority;
    }

    // 2️⃣ Time within same status
    return  b._sort_time - a._sort_time;
  })
  .map(({ _status_priority, _sort_time, ...clean }) => clean);

     /** */

    return new Response(
      JSON.stringify(response),
      { status: 200 , headers: corsHeaders}
    );

  } catch (err) {
    console.error('get_active_orders error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 , headers: corsHeaders}
    );
  }
});


const STATUS_PRIORITY: Record<string, number> = {
  NEW: 1,
  ACCEPTED: 2,
  COMPLETED: 3
};


 function getSortTime(order: any): number {
  switch (order.status) {
    case 'NEW':
      return new Date(order.created_at).getTime();

    case 'ACCEPTED':
      return order.accepted_at
        ? new Date(order.accepted_at).getTime()
        : new Date(order.created_at).getTime();

    case 'COMPLETED':
      return order.completed_at
        ? new Date(order.completed_at).getTime()
        : new Date(order.created_at).getTime();

    default:
      return new Date(order.created_at).getTime();
  }
}


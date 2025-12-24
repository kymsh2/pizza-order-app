import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.0";
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-api-key, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== Deno.env.get('KITCHEN_APP_API_KEY')) {
    return new Response(JSON.stringify({
      error: 'Unauthorized'
    }), {
      status: 401,
      headers: corsHeaders
    });
  }
  const res = await fetch(`${Deno.env.get("WC_STORE_URL")}/wp-json/wc/v3/orders?consumer_key=${Deno.env.get('WC_CONSUMER_KEY')}&consumer_secret=${Deno.env.get('WC_CONSUMER_SECRET')}`, {
    headers: {
      'Authorization': 'Basic ' + btoa(`${Deno.env.get('WC_CONSUMER_KEY')}:${Deno.env.get('WC_CONSUMER_SECRET')}`)
    }
  });
  const orders = await res.json();
  console.log('orders: ' + JSON.stringify(orders));
  for (const order of orders){
    console.log('order::' + JSON.stringify(order));
    // Insert or update customer
    const { billing } = order;
    const customerPayload = {
      wc_customer_id: order.customer_id || null,
      name: `${billing.first_name} ${billing.last_name}`,
      email: billing.email,
      phone: billing.phone,
      address: {
        street: billing.address_1,
        city: billing.city,
        postcode: billing.postcode
      }
    };
    const { data: customerData, error } = await supabase.from('customers').upsert(customerPayload, {
      onConflict: 'email'
    }).select();
    if (error) {
      console.error('Customer upsert error:', error);
      throw error;
    }
    if (!customerData || customerData.length === 0) {
      throw new Error('Customer upsert returned no rows');
    }
    console.log('customerData.length::' + customerData.length);
    console.log('customerData::' + JSON.stringify(customerData));
    const customer_id = customerData[0].id;
    const phone = customerData[0].phone;
    // Check if first order
    const { count, cnterror } = await supabase.from('orders').select('id', {
      count: 'exact',
      head: true
    }).eq('customer_id', customer_id);
    if (cnterror) {
      console.error('Order count error:', cnterror);
      throw cnterror;
    }
    const first_order = count === 0;
    const orderPayload = {
      wc_order_id: order.id,
      store_id: 1,
      status: mapWcStatusToAppStatus(order.status),
      wc_status: order.status,
      customer_id,
      total: order.total,
      payment_method: order.payment_method,
      order_notes: order.customer_note,
      first_order,
      created_at: order.date_created,
      total_tax: order.total_tax,
      discount_total: order.discount_total,
      discount_tax: order.discount_tax
    };
    console.log('wc_order_id:', orderPayload.wc_order_id);
    // Insert order
    const { data: orderData, error: ordererror } = await supabase.from('orders').upsert(orderPayload, {
      onConflict: [
        'wc_order_id'
      ]
    }).select();
    if (ordererror) {
      console.error('Order upsert error:', ordererror);
      throw ordererror;
    }
    console.log('orderData::' + orderData);
    if (!orderData || orderData.length === 0) {
      console.error('Order upsert returned no rows:', orderPayload);
      throw new Error('Order upsert failed');
    }
    const order_id = orderData[0].id;
    // Insert order items
    for (const item of order.line_items){
      const orderItemPayload = {
        id: item.id,
        order_id,
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        meta: item.meta_data,
        variation_id: item.variation_id,
        total: item.total,
        total_tax: item.total_tax,
        size: item.size
      };
      const { orderItemError } = await supabase.from('order_items').upsert(orderItemPayload);
      if (orderItemError) {
        console.error('Order item upsert error:', orderItemError);
        throw orderItemError;
      }
    }
  }
  return new Response(JSON.stringify({
    message: 'Orders synced',
    count: orders.length
  }), {
    headers: corsHeaders
  });
});
function mapWcStatusToAppStatus(wcStatus) {
  switch(wcStatus){
    case 'pending':
    case 'checkout-draft':
    case 'on-hold':
      return 'NEW';
    case 'processing':
      return 'ACCEPTED';
    case 'completed':
      return 'COMPLETED';
    case 'cancelled':
    case 'refunded':
    case 'failed':
    case 'trash':
      return 'CANCELLED';
    default:
      console.warn('Unknown WC status:', wcStatus);
      return 'NEW';
  }
}

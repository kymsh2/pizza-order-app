import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();

  // 🔐 Verify WooCommerce signature
  const signature = req.headers.get("x-wc-webhook-signature");
  const secret = Deno.env.get("WC_WEBHOOK_SECRET");

  // console.log(
  //   "Incoming headers:",
  //   Object.fromEntries(req.headers.entries())
  // );

  if (!signature || !secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(body)
  );

  const expectedSignature = btoa(
    String.fromCharCode(...new Uint8Array(mac))
  );

  if (expectedSignature !== signature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const order = JSON.parse(body);
  console.log("New Order: ", JSON.stringify(order));

  // 🔗 Supabase client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Insert or update customer
    const { billing } = order;
    const customer_name =  `${billing.first_name} ${billing.last_name}`;
    console.log("customer name: " + customer_name)

    const customerPayload = {
      wc_customer_id: order.customer_id || null,
      name: customer_name,
      email: billing.email,
      phone: billing.phone,
      address: {
        street: billing.address_1,
        city: billing.city,
        postcode: billing.postcode
      }
    };

    const { data: customerData, error } = await supabase
      .from('customers')
      .upsert(customerPayload, {
        onConflict: 'email'
      })
      .select();

    if (error) {
      console.error('Customer upsert error:', error);
      throw error;
    }

    if (!customerData || customerData.length === 0) {
      throw new Error('Customer upsert returned no rows');
    }

    console.log('customerData.length::' + customerData.length)
    console.log('customerData::' + JSON.stringify(customerData))
    const customer_id = customerData[0].id;
    const phone = customerData[0].phone;

    // Check if first order
    const { count, cnterror } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customer_id)
      .in("status", ["ACCEPTED", "COMPLETED"]);

    if (cnterror) {
      console.error('Order count error:', cnterror);
      throw cnterror;
    }

    const first_order = (count ?? 0) === 0;


  // 🔍 Check if order already exists
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("wc_order_id", order.id)
    .maybeSingle();

  if (existing) {
    console.log("Order already exists, skipping:", order.id);
    return new Response("OK");
  }

  const orderPayload = {
      wc_order_id: order.id,
      store_id: 1,  // map to your store
      status: "NEW",
      wc_status: order.status,
      customer_id,
      total: order.total,
      payment_method: order.payment_method,
      order_notes: order.customer_note,
      first_order,
      created_at: order.date_created_gmt,
      total_tax: order.total_tax,
      discount_total: order.discount_total,
      discount_tax: order.discount_tax
    };

    // Insert order
    const { data: orderData, error: ordererror } = await supabase.from('orders').upsert(
      orderPayload, { onConflict: ['wc_order_id']}).select();

    if (ordererror) {
      console.error('Order upsert error:', ordererror);
      throw ordererror;
    }

    if (!orderData || orderData.length === 0) {
      console.error('Order upsert returned no rows:', orderPayload);
      throw new Error('Order upsert failed'); 
    }else{
          console.log('order inserted successfully with id :' + orderData[0].id);
    }

     const wc_order_number = order.id;
     const order_id = orderData[0].id;

    // Insert order items
    for (const item of order.line_items) {
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
      const {orderItemError} = await supabase.from('order_items').upsert(orderItemPayload);
      if (orderItemError) {
       console.error('Order item upsert error:', orderItemError);
       throw orderItemError;
      } 
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    let notifyRes: Response | null = null;

 try{
      notifyRes = await fetch(`${SUPABASE_URL}/functions/v1/notify_new_order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        wc_order_number,
        customer_name, 
      }),
      });
      if (!notifyRes.ok) {
        const errorText = await notifyRes.text();
        console.error("❌ notify_new_order failed", {
          status: notifyRes.status,
          statusText: notifyRes.statusText,
          body: errorText,
          order_id,
          wc_order_number
        });
      } else {
        console.log("✅ notify_new_order succeeded", {
          order_id,
          wc_order_number,
          status: notifyRes.status,
        });
      }
    } catch (err) {
      console.error("🔥 notify_new_order fetch error", {
        error: err instanceof Error ? err.message : err,
        order_id,
      });
    }

  return new Response("OK", { headers: corsHeaders });
});

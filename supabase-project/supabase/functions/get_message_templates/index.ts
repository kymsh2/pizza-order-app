import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-api-key, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

  return new Response(
    JSON.stringify({
      sms: {
        orderAccepted:
          "Hi {{customer_name}}, your order# {{order_number}} is accepted.\n Estimated pickup time: {{pickup_time}}.\n– {{store_name}}",
      },
      email: {
        orderAccepted: {
          subject: "Order {{orderNumber}} Confirmed",
          body: "Dear {{customerName}},\n\nYour order is confirmed.\nPickup time: {{pickupTime}}"
        }
      },
      meta: {
        version: 1,
        updated_at: new Date().toISOString(),
      },
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
});

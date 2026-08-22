import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";


const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Expo push notification URL
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";


serve(async (req) => {

  
  try {
    const body = await req.json();
    const { wc_order_number, customer_name } = body;

    if (!wc_order_number || !customer_name) {
      return new Response(JSON.stringify({ error: "Missing wc_order_number or customer_name" }), {
        status: 400,
      });
    }

    // 1️⃣ Get all push tokens
    const { data: tokens, error: tokenError } = await supabase
      .from("push_tokens")
      .select("expo_push_token");

    if (tokenError) throw tokenError;

    if (!tokens || tokens.length === 0) {
      console.log("No registered devices found for push notifications.");
      return new Response(JSON.stringify({ success: true, message: "No devices" }), { status: 200 });
    }

    // 2️⃣ Prepare messages
    const messages = tokens.map((t: any) => ({
      to: t.expo_push_token,
      sound: "default",
      title: "🍕 New Order Received",
      body: `Order number: ${wc_order_number} for ${customer_name}`,
      data: { wc_order_number },
    }));

    // 3️⃣ Send notifications via Expo API
    const resp = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });

    const respJson = await resp.json();
    console.log("Push response:", respJson);

    return new Response(JSON.stringify({ success: true, sent: messages.length }), { status: 200 });
  } catch (err: any) {
    console.error("Failed to send push notification:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});

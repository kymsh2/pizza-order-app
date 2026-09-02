import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-api-key, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // authenticate
  const apiKey = req.headers.get("x-api-key");
  console.log("apiKey: " + apiKey);
  if (apiKey !== Deno.env.get("KITCHEN_APP_API_KEY")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("message_templates")
    .select("template_data, version, updated_at")
    .eq("template_key", "order_confirmation")
    .single();

  if (error || !data) {
    console.error("Failed to load message template:", error);
    return new Response(JSON.stringify({ error: "Template not found" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      ...data.template_data,
      meta: {
        version: data.version,
        updated_at: data.updated_at,
      },
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    },
  );
});

import { serve } from "https://deno.land/std@0.181.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-api-key, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailRequest {
  customer_email: string;
  customer_name: string;
  order_number: string | number;
  pickup_time: string;
  order_total?: string | number;
  payment_method?: string;
  order_date?: string;
  items?: OrderItem[];
}

interface OrderItem {
  name: string;
  quantity: number;
  total?: string | number;
  size?: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = req.headers.get("x-api-key");
  if (!apiKey || apiKey !== Deno.env.get("KITCHEN_APP_API_KEY")) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  const senderEmail = Deno.env.get("BREVO_SENDER_EMAIL");
  const senderName = Deno.env.get("BREVO_SENDER_NAME") ?? "Crusteez Pizza";
  const businessTimeZone =
    Deno.env.get("BUSINESS_TIME_ZONE") ?? "Australia/Melbourne";

  if (!brevoApiKey || !senderEmail) {
    console.error("Brevo email configuration is missing");
    return jsonResponse({ error: "Email service is not configured" }, 500);
  }

  try {
    const body = (await req.json()) as EmailRequest;

    if (
      !body.customer_email ||
      !body.customer_name ||
      !body.order_number ||
      !body.pickup_time
    ) {
      return jsonResponse(
        {
          error:
            "customer_email, customer_name, order_number and pickup_time are required",
        },
        400,
      );
    }

    const orderNumber = String(body.order_number);
    const pickupTime = formatPickupTime(body.pickup_time, businessTimeZone);
    const orderDate = body.order_date
      ? formatOrderDate(body.order_date, businessTimeZone)
      : "";
    const orderTotal = formatCurrency(body.order_total);
    const template = await loadEmailTemplate();
    const values = {
      customer_name: body.customer_name,
      order_number: orderNumber,
      pickup_time: pickupTime,
      order_date_suffix: orderDate ? ` (${orderDate})` : "",
      items_html: buildItemsHtml(body.items ?? []),
      items_text: buildItemsText(body.items ?? []),
      order_total: orderTotal,
      payment_method: body.payment_method ?? "",
    };
    const subject = renderTemplate(template.subject, values);
    const htmlContent = renderTemplate(template.body, values);
    const textContent = renderTemplate(template.text, values);

    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: body.customer_email, name: body.customer_name }],
        subject,
        textContent,
        htmlContent,
      }),
    });

    if (!brevoResponse.ok) {
      const errorText = await brevoResponse.text();
      console.error("Brevo email request failed", {
        status: brevoResponse.status,
        body: errorText,
        order_number: orderNumber,
      });
      return jsonResponse({ error: "Email delivery failed" }, 502);
    }

    const result = await brevoResponse.json();
    console.log("Brevo email sent", {
      message_id: result.messageId,
      order_number: orderNumber,
      customer_email: body.customer_email,
    });

    return jsonResponse({ success: true, message_id: result.messageId });
  } catch (error) {
    console.error("send-order-confirmation-email error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function formatPickupTime(value: string, timeZone: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("pickup_time must be a valid date");
  }

  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("weekday")}, ${getPart("day")} ${getPart("month")} ${getPart("year")} at ${getPart("hour")}:${getPart("minute")} ${getPart("dayPeriod").toUpperCase()}`;
}

function formatOrderDate(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatCurrency(value: string | number | undefined): string {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

async function loadEmailTemplate(): Promise<{
  subject: string;
  body: string;
  text: string;
}> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await supabase
    .from("message_templates")
    .select("template_data")
    .eq("template_key", "order_confirmation")
    .single();

  if (
    error ||
    !data?.template_data?.email?.orderAccepted?.subject ||
    !data?.template_data?.email?.orderAccepted?.body ||
    !data?.template_data?.email?.orderAccepted?.text
  ) {
    throw new Error("Order confirmation email template not found");
  }

  return data.template_data.email.orderAccepted;
}

function buildItemsHtml(items: OrderItem[]): string {
  return items
    .map(
      (item, index) => `
        <tr>
          <td style="padding:${index === 0 ? "8px" : "20px 12px 20px 0"}; color:#1e1e1e; border-bottom:1px solid rgba(0,0,0,.2);">
            ${escapeHtml(item.name)}${item.size ? `<div style="color:#787c82;font-size:14px;line-height:140%;">Size: ${escapeHtml(item.size)}</div>` : ""}
          </td>
          <td align="right" style="padding:${index === 0 ? "8px" : "20px 0 20px 12px"}; border-bottom:1px solid rgba(0,0,0,.2); white-space:nowrap;">
            x${item.quantity}&nbsp;&nbsp; $${formatCurrency(item.total)}
          </td>
        </tr>`,
    )
    .join("");
}

function buildItemsText(items: OrderItem[]): string {
  return items
    .map(
      (item) => `${item.name} x${item.quantity} $${formatCurrency(item.total)}`,
    )
    .join("\n");
}

function renderTemplate(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/{{(.*?)}}/g, (_, key: string) => values[key] ?? "");
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

CREATE TABLE IF NOT EXISTS public.message_templates (
  template_key text PRIMARY KEY,
  template_data jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

INSERT INTO public.message_templates (template_key, template_data, version)
VALUES (
  'order_confirmation',
  jsonb_build_object(
    'sms', jsonb_build_object(
      'orderAccepted', 'Hi {{customer_name}}, your order# {{order_number}} is accepted.\n Estimated pickup time: {{pickup_time}}.\n– {{store_name}}'
    ),
    'email', jsonb_build_object(
      'orderAccepted', jsonb_build_object(
        'subject', 'Your crusteezpizza order is getting prepared!',
        'text', 'Dear {{customer_name}},\n\nGreat news - your order has been accepted and is now being prepared.\nPickup time: {{pickup_time}}\n\nOrder summary - Order #{{order_number}}\n{{items_text}}\nTotal: ${{order_total}}\n\nCrusteez Pizza',
        'body', '<!doctype html>
<html lang="en-AU">
  <body style="margin:0;padding:0;background:#fff;color:#4b4b4b;font-family:Helvetica Neue,Helvetica,Roboto,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#fff;"><tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#fff;">
        <tr><td style="padding:32px 32px 0;"><img src="https://crusteezpizza.com.au/wp-content/uploads/2025/07/cropped-Logo-Footer.webp" alt="crusteezpizza" width="120" style="display:block;width:120px;height:auto;border:0;"></td></tr>
        <tr><td style="padding:20px 32px 0;"><h1 style="margin:0;color:#1e1e1e;font-size:32px;line-height:120%;font-weight:700;">Your order is confirmed!</h1></td></tr>
        <tr><td style="padding:20px 32px 32px;font-size:16px;line-height:150%;">
          <p style="margin:0 0 16px;">Hi {{customer_name}},</p>
          <p style="margin:0 0 16px;">Great news - your order has been accepted and is now being prepared.</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;border:1px solid #e5e5e5;border-radius:4px;background:#fff;"><tr><td style="padding:20px;">
            <p style="margin:0 0 6px;color:#787c82;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;">Pickup time</p>
            <p style="margin:0;color:#1e1e1e;font-size:22px;line-height:130%;font-weight:700;">{{pickup_time}}</p>
            <p style="margin:8px 0 0;color:#787c82;font-size:13px;">Please arrive at the pickup time shown above.</p>
          </td></tr></table>
          <h2 style="margin:0 0 18px;color:#1e1e1e;font-size:20px;line-height:160%;">Order summary<br><span style="display:block;color:#787c82;font-size:14px;font-weight:normal;">Order #{{order_number}}{{order_date_suffix}}</span></h2>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="color:#4b4b4b;font-size:15px;">{{items_html}}
            <tr><td style="padding:24px 12px 5px 0;">Subtotal:</td><td align="right" style="padding:24px 0 5px 12px;">${{order_total}}</td></tr>
            <tr><th align="left" style="padding:5px 12px 5px 0;color:#4b4b4b;font-size:20px;">Total:</th><th align="right" style="padding:5px 0 5px 12px;color:#4b4b4b;font-size:20px;">${{order_total}}</th></tr>
            <tr><td style="padding:5px 12px 24px 0;border-bottom:1px solid rgba(0,0,0,.2);">Payment method:</td><td align="right" style="padding:5px 0 24px 12px;border-bottom:1px solid rgba(0,0,0,.2);white-space:nowrap;">{{payment_method}}</td></tr>
          </table>
          <p style="margin:32px 0 16px;text-align:center;">Thanks again! If you need any help with your order, please contact us at crusteezpizza@yahoo.com.</p>
        </td></tr>
        <tr><td style="padding:32px;border-top:1px solid rgba(0,0,0,.2);color:#787c82;font-size:12px;line-height:140%;text-align:center;"><p style="margin:0;">crusteezpizza<br>Tasmania, Australia</p></td></tr>
      </table>
    </td></tr></table>
  </body>
</html>'
      )
    )
  ),
  1
)
ON CONFLICT (template_key) DO UPDATE SET
  template_data = EXCLUDED.template_data,
  version = EXCLUDED.version,
  updated_at = now();

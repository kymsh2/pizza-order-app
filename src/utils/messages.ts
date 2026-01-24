import * as SMS from "expo-sms";
import { Platform } from "react-native";
import { MessageTemplate } from "../type/messageTemplate";
import { Order } from "../type/orders";
import { appError, appLog, appWarn } from "./logger"; // use your existing logger

export async function sendOrderConfirmation(order: Order, messageTemplate: MessageTemplate | null) {

  appLog("Order confirmation template:", JSON.stringify(messageTemplate));

  const template = messageTemplate?.sms?.orderAccepted;

  // 1. Safety checks
  if (!template) {
    appWarn("SMS template missing");
    return;
  }

  // if (order.smsSent) {
  //   console.log("SMS already sent for order", order.id);
  //   return;
  // }

  // 2. Build message
  const message = fillTemplate(
    template,
    {
      customer_name: order.customer.name,
      order_number: order.wc_order_id.toString(),
      pickup_time: order.pickup_at || "as soon as possible",
      store_name: "Crusteez Pizza" // You can make this dynamic if needed
    }
  );

  appLog("Sending SMS:", message);

  try {
    // 3. Open native SMS app
    sendSms(order.customer.phone!, message);

    // 4. Persist sent flag (optimistic)
    //await markSmsSent(order.id);

  } catch (error) {
    console.error("Failed to send SMS", error);
  }
}


/**
 * Send SMS from device
 * @param phoneNumber E.g. "+614XXXXXXXX"
 * @param message SMS body
 */
export async function sendSms(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    // Web / iOS simulator safety
    if (Platform.OS !== "android") {
      appWarn("SMS not supported on this platform");
      return false;
    }

    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      appWarn("SMS not available on this device");
      return false;
    }

    appLog("Sending SMS to:", phoneNumber);

    const result = await SMS.sendSMSAsync(phoneNumber, message);

    if (result.result === "sent") {
      appLog("SMS sent successfully");
      return true;
    }

    appWarn("SMS not sent, result:", result.result);
    return false;
  } catch (err) {
    appError("Failed to send SMS:", err);
    return false;
  }
}


export function fillTemplate(
  template: string,
  values: Record<string, string>
): string {
  
  appLog("Resolving template:", template, JSON.stringify(values));

  let result = template;

  Object.entries(values).forEach(([key, value]) => {
    result = result.replaceAll(`{{${key}}}`, value);
  });

  return result;
}


export function resolveTemplate(template: string, data: Record<string, string>): string {
  appLog("Resolving template:", template, JSON.stringify(data));
  return template.replace(/{{(.*?)}}/g, (_, key) => data[key] || "");
}



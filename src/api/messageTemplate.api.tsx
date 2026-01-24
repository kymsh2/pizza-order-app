import Constants from "expo-constants";
import { MessageTemplate } from "../type/messageTemplate";
import { appError, appLog } from "../utils/logger";

const SUBABASE_URL_BASE = Constants.expoConfig?.extra?.env?.SUBABASE_URL_BASE;
const SUPABASE_KEY = Constants.expoConfig?.extra?.env?.KITCHEN_APP_API_KEY;

if (!SUBABASE_URL_BASE || !SUPABASE_KEY) {
  throw new Error(
    "Environment variables for supabase url and supabase key are not set."
  );
}

const SUBABASE_FUNCTION_URL = SUBABASE_URL_BASE + "/functions/v1";

const CONSUMER_KEY = "";
const CONSUMER_SECRET = "";

//let cachedTemplates: messageTemplate | null = null;

export async function fetchMessageTemplates() {
  //if (cachedTemplates) return cachedTemplates;

  appLog("Fetching message template from Supabase function...");
  if (!SUPABASE_KEY) {
    throw new Error("Supabase API key is not set in environment variables.");
  }

  const url = `${SUBABASE_FUNCTION_URL}/get_message_templates`;

  const config = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": SUPABASE_KEY,
    },
  };

  try {
    const res = await fetch(url, config);
    const template: MessageTemplate = await res.json();

    //cachedTemplates = json;
    appLog("Message templates loaded", JSON.stringify(template));

    return template;
  } catch (err) {
    appError("Failed to load message templates", err);
    return null;
  }
}

export function getSmsTemplate(template: MessageTemplate): string | null {
  appLog("Retrieving SMS template for key:", JSON.stringify(template));

  return template?.sms?.orderAccepted;
}

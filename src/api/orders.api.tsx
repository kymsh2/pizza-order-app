import { WooOrder } from "@/src/type/wc_orders";
import Constants from "expo-constants";
import { AcceptOrderResponse, Order } from "../type/orders";

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

/**********************
 * Accept order
 **********************/
export async function acceptOrder(
  orderId: string,
  prepMinutes: number
): Promise<AcceptOrderResponse> {
  console.log("Accepting order via Supabase function...");
  if (!SUPABASE_KEY) {
    throw new Error("Supabase API key is not set in environment variables.");
  }

  const url = `${SUBABASE_FUNCTION_URL}/accept-order`;

  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": SUPABASE_KEY,
    },
    body: JSON.stringify({
      order_id: orderId,
      prep_minutes: prepMinutes,
    }),
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(
        `Network response was not ok: ${response.status} ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    throw new Error(
      error?.message || "Unknown error occurred while fetching orders"
    );
  }
}
/**********************
 * Fetch orders
 **********************/

export async function fetchOrders(): Promise<Order[]> {
  console.log("Fetching supbase orders from API  ...");
  if (!SUPABASE_KEY) {
    throw new Error("Supabase API key is not set in environment variables.");
  }
  const url = `${SUBABASE_FUNCTION_URL}/get_active_orders`;
  const config = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": SUPABASE_KEY,
    },
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(
        `Network response was not ok: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Fetched data is not an array");
    }
    return data;
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    throw new Error(
      error?.message || "Unknown error occurred while fetching orders"
    );
  }
}

/**********************
 * Order completion
 **********************/

export async function completeOrder(orderId: string) {
  const url = `${SUBABASE_FUNCTION_URL}/complete_order`;
  const config = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": SUPABASE_KEY,
    },
    body: JSON.stringify({ order_id: orderId }),
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(
        `Network response was not ok: ${response.status} ${response.statusText}`
      );
    }
  } catch (err) {
    console.error("Failed to complete order:", err);
  }
}

/** not used in app ***/
/**********************
 * Fetch WooCommerce orders
 **********************/
export async function fetchWooCommerceOrders(): Promise<WooOrder[]> {
  console.log("Fetching orders from API...");
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error(
      "WooCommerce API keys are not set in environment variables."
    );
  }
  const url = `https://crusteezpizza.com.au/wp-json/wc/v3/orders?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Network response was not ok: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Fetched data is not an array");
    }
    return data;
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    throw new Error(
      error?.message || "Unknown error occurred while fetching orders"
    );
  }
}

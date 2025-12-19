import { WooOrder } from "@/src/type/wc_orders";
import { AcceptOrderResponse, Order } from "../type/orders";

const CONSUMER_KEY = process.env.EXPO_PUBLIC_WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.EXPO_PUBLIC_WC_CONSUMER_SECRET;
const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_KITCHEN_APP_API_KEY ||
  "sk_Cq4bSazW9r1BkDknD0ii4sqEWo0kWYpn";

export async function acceptOrder(
  orderId: string,
  prepMinutes: number
): Promise<AcceptOrderResponse> {
  console.log("Accepting order via Supabase function...");
  if (!SUPABASE_KEY) {
    throw new Error("Supabase API key is not set in environment variables.");
  }

  const url = `https://bufiduycxibmrbtfsdkk.supabase.co/functions/v1/accept-order`;

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

  console.log("Using API key:", SUPABASE_KEY);

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

export async function fetchOrders(): Promise<Order[]> {
  console.log("Fetching supbase orders from API  ...");
  if (!SUPABASE_KEY) {
    throw new Error("Supabase API key is not set in environment variables.");
  }
  const url = `https://bufiduycxibmrbtfsdkk.supabase.co/functions/v1/get_active_orders`;
  const config = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": SUPABASE_KEY,
    },
  };

  console.log("Using API key:", SUPABASE_KEY);

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

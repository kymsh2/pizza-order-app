import { WooOrder } from "@/src/type/wc_orders";

const CONSUMER_KEY = process.env.EXPO_PUBLIC_WC_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.EXPO_PUBLIC_WC_CONSUMER_SECRET;

export async function fetchOrders(): Promise<WooOrder[]> {
  console.log("Fetching orders from API...");
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    throw new Error(
      "WooCommerce API keys are not set in environment variables."
    );
  }
  const url = `https://bufiduycxibmrbtfsdkk.supabase.co/functions/v1/get_active_orders`;
  const config = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.EXPO_PUBLIC_KITCHEN_APP_API_KEY || "",
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

const response = await fetch(
  "https://PROJECT_ID.supabase.co/functions/v1/get_active_orders",
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "sk_live_pizza_kitchen_123",
    },
  }
);

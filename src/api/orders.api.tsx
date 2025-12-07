import { WooOrder } from "@/src/type/orders";

export async function fetchOrders(): Promise<WooOrder[]> {
  console.log("Fetching orders from API...");
  const url =
    "https://crusteezpizza.com.au/wp-json/wc/v3/orders?consumer_key=ck_45b370fe5e03b983113a221dfc605a41b9f8f5c8&consumer_secret=cs_c61752e009254b33ab0da9939531327fd8e1dca4";
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

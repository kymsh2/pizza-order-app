import { appLog } from "../utils/logger";
import { supabase } from "./client";

export function subscribeToOrders(
  onChange: (order: any, event: "INSERT" | "UPDATE" | "DELETE") => void
) {
  console.log("Subscribe to realtime on Orders");
  const channel = supabase
    .channel("orders-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "orders",
        filter: "status=in.(NEW)",
      },
      (payload) => {
        appLog("Realtime order event:", payload);
        onChange(payload.new, payload.eventType);
      }
    )
    .subscribe((status) => {
      console.log("Realtime status:", status);
    });

  return channel;
}

export function unsubscribeFromOrders(channel: any) {
  supabase.removeChannel(channel);
}

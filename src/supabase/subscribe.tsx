import { Order } from "../type/orders";
import { supabase } from "./client";

export function subscribeToOrders(
  onChange: (order: Order, event: "INSERT" | "UPDATE" | "DELETE") => void
) {
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
        console.log("Realtime order event:", payload);

        onChange(payload.new as Order, payload.eventType);
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromOrders(channel: any) {
  supabase.removeChannel(channel);
}

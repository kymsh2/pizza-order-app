import { supabase } from "./client";

export function subscribeToOrders(
  onChange: (order: any, event: "INSERT" | "UPDATE" | "DELETE") => void
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
        appLog("Realtime order event:", payload);
        onChange(payload.new, payload.eventType);
      }
    )
    .subscribe();

  return channel;
}

export function unsubscribeFromOrders(channel: any) {
  supabase.removeChannel(channel);
}

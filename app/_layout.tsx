import { savePushToken } from "@/src/api/orders.api";
import {
  registerForPushToken,
  requestNotificationPermission,
} from "@/src/utils/notifications";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  //Expo Push Token Registration (when app is in background/killed)
  useEffect(() => {
    (async () => {
      const token = await registerForPushToken();
      console.log("📲 Expo Push Token:", token);
      if (!token) return;
      await savePushToken(token);
    })();

    // Local notification permission on mount (app in foreground)
    requestNotificationPermission();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(home)/index" />
      <Stack.Screen name="(home)/OrderDetail" />
    </Stack>
  );
}

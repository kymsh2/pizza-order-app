import { savePushToken } from "@/src/api/orders.api";
import { appError, appLog } from "@/src/utils/logger";
import {
  registerForPushToken,
  requestNotificationPermission,
} from "@/src/utils/notifications";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  //Expo Push Token Registration (when app is in background/killed)
  useEffect(() => {
    appLog("inside RootLayout useEffect");
    (async () => {
      try {
        appLog("calling registerForPushToken from RootLayout");
        const token = await registerForPushToken();
        appLog("📲 Expo Push Token:", token);
        if (!token) return;

        await savePushToken(token);
      } catch (error) {
        appError("Error in push token registration inner try-catch:", error);
      }
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

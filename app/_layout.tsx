import { requestNotificationPermission } from "@/src/utils/notifications";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(home)/index" />
      <Stack.Screen name="(home)/OrderDetail" />
    </Stack>
  );
}

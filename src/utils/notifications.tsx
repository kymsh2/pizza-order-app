import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Always show notification when received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function playNewOrderSound() {
  const { sound } = await Audio.Sound.createAsync(
    require("../../assets/sounds/new-order.mp3")
  );
  await sound.playAsync();
}

export async function showNewOrderNotification(customerName: string) {
  if (Platform.OS === "web") {
    return; // ❌ no notifications on web
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🍕 New Order Received",
      body: `Order from ${customerName}`,
      sound: "default",
    },
    trigger: null, // immediate
  });
}

import { Audio } from "expo-av";
import * as Device from "expo-device";
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
  //   if (Platform.OS === "web") {
  //     return; // ❌ no notifications on web
  //   }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🍕 New Order Received",
      body: `Order Id: ${customerName}`,
      sound: "default",
    },
    trigger: null, // immediate
  });
}

/**
 * Register device for push notifications
 * Returns Expo push token (string) or null
 */
export async function registerForPushToken() {
  // Skip web — push notifications not supported / need VAPID
  if (Platform.OS === "web") {
    console.log("Web platform detected — skipping push token registration");
    return null;
  }

  // Check device type
  if (!Device.isDevice) {
    console.log("Push notifications require a real device");
    return null;
  }

  // Android channel (required)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Orders",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // Check permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push notification permission not granted");
    return null;
  }

  // 🔑 Get Expo Push Token
  const token = await Notifications.getExpoPushTokenAsync();

  return token.data; // ← THIS is what backend needs
}

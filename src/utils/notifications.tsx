import { Audio } from "expo-av";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { appError, appLog, appWarn } from "./logger";

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

// Listen to push notifications received in foreground
export function addNotificationReceivedListener(
  notificationReceivedHandler: any
) {
  return Notifications.addNotificationReceivedListener(
    notificationReceivedHandler
  );
}

// Listen to push notification responses (taps)
export function addNotificationResponseListener(
  notificationResponseHandler: any
) {
  return Notifications.addNotificationResponseReceivedListener(
    notificationResponseHandler
  );
}

// show  Supabase Realtime new order notification
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
  appLog("Registering for push notifications");
  // Skip web — push notifications not supported / need VAPID
  if (Platform.OS === "web") {
    appLog("Web platform detected — skipping push token registration");
    return null;
  }

  // Check device type
  if (!Device.isDevice) {
    appLog("Push notifications require a real device");
    return null;
  }

  // Android channel (required)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("orders", {
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
    appWarn("Push notification permission not granted");
    return null;
  }

  appLog("Constants.easConfig?.projectId:", Constants.easConfig?.projectId);
  appLog(
    "Constants.expoConfig?.extra?.eas?.projectId:",
    Constants.expoConfig?.extra?.eas?.projectId
  );

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;

  if (!projectId) {
    appError("Missing EAS projectId — cannot get push token");
    return null;
  }

  // 🔑 Get Expo Push Token
  const token = await Notifications.getExpoPushTokenAsync({ projectId });

  appLog("token.data:", token.data);

  return token.data; // ← THIS is what backend needs
}

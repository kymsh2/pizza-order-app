import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(home)/index" />
      <Stack.Screen name="(home)/OrderDetail" />
    </Stack>
  );
}

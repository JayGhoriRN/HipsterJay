import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="routeMap" options={{ title: "Route Map" }} />
      <Stack.Screen
        name="locationSearch"
        options={{ title: "Location Search" }}
      />
    </Stack>
  );
}

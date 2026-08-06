import { Stack } from "expo-router";

const AUTH_BG = "#f3edff";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: AUTH_BG },
      }}
    />
  );
}

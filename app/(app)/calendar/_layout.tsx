import { Stack } from "expo-router";

export default function CalendarLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="journal/[diaryId]" />
      <Stack.Screen name="analysis/[date]" />
    </Stack>
  );
}

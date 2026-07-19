import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function OnboardingLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor:
            colorScheme === "dark" ? "#17182D" : "#EED3F2",
        },
      }}
    >
      <Stack.Screen
        name="language"
        options={{
          animation: "fade",
        }}
      />

      <Stack.Screen
        name="introduction"
        options={{
          animation: "slide_from_right",
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
}
import "@/ReactotronConfig";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useAppTheme } from "@/hooks/useAppTheme";
import i18n from "@/i18n";
import { useAppStore } from "@/store/use-language-store";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  type Theme,
} from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  if (__DEV__) {
    require("@/ReactotronConfig");
  }
  const { isDark, mode, colors } = useAppTheme();
  const language = useAppStore((state) => state.language);
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated || !language) {
      return;
    }

    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
  }, [hasHydrated, language]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 30_000,
          },
        },
      })
  );

  const navigationTheme = useMemo<Theme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.primary,
      },
    };
  }, [colors, isDark]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
    <QueryClientProvider client={queryClient}>
      <GluestackUIProvider mode={mode}>
        <ThemeProvider value={navigationTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: "fade",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="journal" />
          </Stack>
          {/*
            Default for non-Home screens (system theme).
            Home overrides while focused via time-based day/night StatusBar.
          */}
          <StatusBar
            style={isDark ? "light" : "dark"}
            translucent
            backgroundColor="transparent"
          />
        </ThemeProvider>
      </GluestackUIProvider>
    </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

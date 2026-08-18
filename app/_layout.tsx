import "@/ReactotronConfig";
import { DayNightProvider } from "@/components/day-night/DayNightProvider";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";
import { useAppTheme } from "@/hooks/useAppTheme";
import i18n from "@/i18n";
import { toI18nLanguage, useAppStore } from "@/store/use-language-store";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
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
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

void SplashScreen.preventAutoHideAsync();

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

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    "Pretendard-Regular": require("@/assets/fonts/Pretendard-Regular.otf"),
    "Pretendard-Medium": require("@/assets/fonts/Pretendard-Medium.otf"),
    "Pretendard-SemiBold": require("@/assets/fonts/Pretendard-SemiBold.otf"),
    "Pretendard-Bold": require("@/assets/fonts/Pretendard-Bold.otf"),
  });

  useEffect(() => {
    if (!hasHydrated || !language) {
      return;
    }

    if (i18n.language !== toI18nLanguage(language)) {
      void i18n.changeLanguage(toI18nLanguage(language));
    }
  }, [hasHydrated, language]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

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

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <QueryClientProvider client={queryClient}>
        <DayNightProvider>
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
              <StatusBar
                style={isDark ? "light" : "dark"}
                translucent={false}
              />
            </ThemeProvider>
          </GluestackUIProvider>
        </DayNightProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

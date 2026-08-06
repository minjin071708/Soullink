import {
  darkColors,
  lightColors,
  type AppColors,
  type ColorSchemeMode,
} from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type AppTheme = {
  isDark: boolean;
  mode: ColorSchemeMode;
  colors: AppColors;
};

/**
 * System Light/Dark theme only.
 * Independent from time-based greeting / mascot (`useDayNightPeriod`).
 */
export function useAppTheme(): AppTheme {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    isDark,
    mode: isDark ? "dark" : "light",
    colors: isDark ? darkColors : lightColors,
  };
}

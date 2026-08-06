/**
 * App color tokens.
 *
 * Two independent systems:
 * 1) System Light/Dark (`lightColors` / `darkColors` via `useAppTheme`) — UI chrome only
 * 2) Time-based day/night (`useDayNightPeriod`) — greeting, hero bg, mascot only
 *
 * Do not mix them.
 */

import { Platform } from "react-native";

export const lightColors = {
  background: "#FCFAFF",
  surface: "#FFFFFF",
  surfaceSecondary: "#F3EEFF",
  text: "#29263B",
  textSecondary: "#9692AA",
  primary: "#8B6FE8",
  border: "#EEEAF5",
  icon: "#777287",
  tabBar: "#FFFFFF",
  tabInactive: "#B9BDD5",
  danger: "#E5484D",
  overlay: "rgba(23, 23, 42, 0.45)",
} as const;

export const darkColors: { [K in keyof typeof lightColors]: string } = {
  background: "#17172A",
  surface: "#25233A",
  surfaceSecondary: "#302C49",
  text: "#F7F5FF",
  textSecondary: "#AAA6BE",
  primary: "#A58AF3",
  border: "#37334D",
  icon: "#C4BED7",
  tabBar: "#211F34",
  tabInactive: "#7A7693",
  danger: "#FF6369",
  overlay: "rgba(0, 0, 0, 0.55)",
};

export type AppColors = { [K in keyof typeof lightColors]: string };
export type ColorSchemeMode = "light" | "dark";

/** @deprecated Prefer `lightColors` / `darkColors` + `useAppTheme()`. Kept for Expo template helpers. */
export const Colors = {
  light: {
    text: lightColors.text,
    background: lightColors.background,
    tint: lightColors.primary,
    icon: lightColors.icon,
    tabIconDefault: lightColors.tabInactive,
    tabIconSelected: lightColors.primary,
  },
  dark: {
    text: darkColors.text,
    background: darkColors.background,
    tint: darkColors.primary,
    icon: darkColors.icon,
    tabIconDefault: darkColors.tabInactive,
    tabIconSelected: darkColors.primary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

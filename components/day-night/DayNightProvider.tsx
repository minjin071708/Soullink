import {
  useDayNightPeriodController,
  type DayNightPeriod,
} from "@/hooks/use-day-night-period";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ImageSourcePropType } from "react-native";

const DAY_BACKGROUND = require("@/assets/images/daybg.png");
const NIGHT_BACKGROUND = require("@/assets/images/nightbg.png");

type DayNightColors = {
  background: string;
  text: string;
  mutedText: string;
  card: string;
};

export type DayNightTheme = {
  period: DayNightPeriod;
  isDay: boolean;
  isNight: boolean;
  backgroundSource: ImageSourcePropType;
  colors: DayNightColors;
  statusBarStyle: "light" | "dark";
};

const DAY_COLORS: DayNightColors = {
  background: "#f7f8fc",
  text: "#2A2A6A",
  mutedText: "#6E6E8A",
  card: "#FFFFFF",
};

const NIGHT_COLORS: DayNightColors = {
  background: "#595168",
  text: "#FFFFFF",
  mutedText: "rgba(255,255,255,0.72)",
  card: "rgba(255,255,255,0.08)",
};

const DayNightThemeContext = createContext<DayNightTheme | null>(null);

export function DayNightProvider({ children }: { children: ReactNode }) {
  const period = useDayNightPeriodController();

  const value = useMemo<DayNightTheme>(() => {
    const isNight = period === "night";

    return {
      period,
      isDay: !isNight,
      isNight,
      backgroundSource: isNight ? NIGHT_BACKGROUND : DAY_BACKGROUND,
      colors: isNight ? NIGHT_COLORS : DAY_COLORS,
      statusBarStyle: isNight ? "light" : "dark",
    };
  }, [period]);

  return (
    <DayNightThemeContext.Provider value={value}>
      {children}
    </DayNightThemeContext.Provider>
  );
}

export function useDayNightTheme(): DayNightTheme {
  const theme = useContext(DayNightThemeContext);

  if (!theme) {
    throw new Error("useDayNightTheme must be used within DayNightProvider.");
  }

  return theme;
}

import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

export type DayNightPeriod = "day" | "night";

/** Daytime: [06:00, 18:00). Nighttime: [18:00, 06:00). */
export function getDayNightPeriod(date: Date = new Date()): DayNightPeriod {
  const hour = date.getHours();
  return hour >= 6 && hour < 18 ? "day" : "night";
}

function getMsUntilNextPeriodChange(date: Date = new Date()): number {
  const next = new Date(date);
  const hour = date.getHours();

  if (hour < 6) {
    next.setHours(6, 0, 0, 0);
  } else if (hour < 18) {
    next.setHours(18, 0, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(6, 0, 0, 0);
  }

  return Math.max(next.getTime() - date.getTime(), 0);
}

/**
 * Internal controller for the app-wide day/night provider.
 * Mount this once near the root layout; consumers should use
 * `useDayNightTheme()` instead.
 */
export function useDayNightPeriodController(): DayNightPeriod {
  const [period, setPeriod] = useState<DayNightPeriod>(() =>
    getDayNightPeriod()
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const syncPeriod = useCallback(() => {
    setPeriod(getDayNightPeriod());
  }, []);

  const scheduleNextBoundary = useCallback(() => {
    clearTimer();

    const delay = getMsUntilNextPeriodChange();
    timerRef.current = setTimeout(() => {
      syncPeriod();
      scheduleNextBoundary();
    }, delay);
  }, [clearTimer, syncPeriod]);

  useEffect(() => {
    syncPeriod();
    scheduleNextBoundary();

    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        const wasBackground =
          appStateRef.current === "background" ||
          appStateRef.current === "inactive";
        appStateRef.current = nextState;

        if (wasBackground && nextState === "active") {
          syncPeriod();
          scheduleNextBoundary();
        }
      }
    );

    return () => {
      clearTimer();
      subscription.remove();
    };
  }, [clearTimer, scheduleNextBoundary, syncPeriod]);

  return period;
}

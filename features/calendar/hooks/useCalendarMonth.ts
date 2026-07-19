import { getCalendarMonth } from "@/features/calendar/api/calendarApi";
import { useQuery } from "@tanstack/react-query";

export const calendarMonthQueryKey = (year: number, month: number) =>
  ["calendar", year, month] as const;

export function useCalendarMonth(year: number, month: number, enabled = true) {
  return useQuery({
    queryKey: calendarMonthQueryKey(year, month),
    queryFn: () => getCalendarMonth(year, month),
    enabled,
  });
}

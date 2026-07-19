import { getDailyJournals } from "@/features/calendar/api/calendarApi";
import { useQuery } from "@tanstack/react-query";

export const dailyJournalsQueryKey = (date: string) =>
  ["dailyJournals", date] as const;

export function useDailyJournals(selectedDate: string | undefined) {
  return useQuery({
    queryKey: dailyJournalsQueryKey(selectedDate ?? ""),
    queryFn: () => getDailyJournals(selectedDate as string),
    enabled: Boolean(selectedDate),
  });
}

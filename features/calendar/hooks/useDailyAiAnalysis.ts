import { getDailyAiAnalysis } from "@/features/calendar/api/calendarApi";
import { useQuery } from "@tanstack/react-query";

export const dailyAnalysisQueryKey = (date: string) =>
  ["calendar", "analysis", date] as const;

export function useDailyAiAnalysis(date: string | undefined) {
  return useQuery({
    queryKey: dailyAnalysisQueryKey(date ?? ""),
    queryFn: () => getDailyAiAnalysis(date as string),
    enabled: Boolean(date),
  });
}

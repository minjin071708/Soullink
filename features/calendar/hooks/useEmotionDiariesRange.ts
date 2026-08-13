import { fetchEmotionDiariesByRangeApi } from "@/api/journalApi";
import { getMonthDateRange } from "@/features/calendar/utils/calendar.utils";
import { useQuery } from "@tanstack/react-query";

export const emotionDiariesRangeQueryKey = (
  fromDate: string,
  toDate: string
) => ["emotion-diaries", "range", fromDate, toDate] as const;

/** EMO-003 — diaries for an inclusive fromDate/toDate range. */
export function useEmotionDiariesByRange(
  fromDate: string,
  toDate: string,
  enabled = true
) {
  return useQuery({
    queryKey: emotionDiariesRangeQueryKey(fromDate, toDate),
    queryFn: () => fetchEmotionDiariesByRangeApi({ fromDate, toDate }),
    enabled: enabled && Boolean(fromDate && toDate),
    staleTime: 60 * 1000,
  });
}

/** Fetches diaries for the visible calendar month. */
export function useEmotionDiariesRange(year: number, month: number) {
  const { fromDate, toDate } = getMonthDateRange(year, month);
  return useEmotionDiariesByRange(fromDate, toDate);
}

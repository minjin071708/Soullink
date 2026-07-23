import { fetchEmotionDiariesByRangeApi } from "@/api/journalApi";
import { getMonthDateRange } from "@/features/calendar/utils/calendar.utils";
import { useQuery } from "@tanstack/react-query";

export const emotionDiariesRangeQueryKey = (
  fromDate: string,
  toDate: string
) => ["emotion-diaries", "range", fromDate, toDate] as const;

/** Fetches diaries for the visible calendar month. */
export function useEmotionDiariesRange(year: number, month: number) {
  const { fromDate, toDate } = getMonthDateRange(year, month);

  return useQuery({
    queryKey: emotionDiariesRangeQueryKey(fromDate, toDate),
    queryFn: () => fetchEmotionDiariesByRangeApi({ fromDate, toDate }),
  });
}

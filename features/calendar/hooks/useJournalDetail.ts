import { getJournalDetail } from "@/features/calendar/api/calendarApi";
import { useQuery } from "@tanstack/react-query";

export const journalDetailQueryKey = (diaryId: number) =>
  ["calendar", "journal", diaryId] as const;

export function useJournalDetail(diaryId: number | undefined) {
  return useQuery({
    queryKey: journalDetailQueryKey(diaryId ?? 0),
    queryFn: () => {
      if (diaryId === undefined) {
        throw new Error("A valid diaryId is required.");
      }
      return getJournalDetail(diaryId);
    },
    enabled: diaryId !== undefined,
  });
}

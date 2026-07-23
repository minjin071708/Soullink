import { fetchJournalResultApi } from "@/api/journalApi";
import { useQuery } from "@tanstack/react-query";

export const journalDetailQueryKey = (diaryId: number) =>
  ["emotion-diary", "detail", diaryId] as const;

export function useJournalDetail(diaryId: number | undefined) {
  return useQuery({
    queryKey: journalDetailQueryKey(diaryId ?? 0),
    queryFn: () => {
      if (diaryId === undefined) {
        throw new Error("A valid diaryId is required.");
      }
      return fetchJournalResultApi(diaryId);
    },
    enabled: diaryId !== undefined,
    retry: 1,
  });
}

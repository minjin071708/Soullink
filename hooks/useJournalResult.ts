import { fetchJournalResultApi } from "@/api/journalApi";
import { useQuery } from "@tanstack/react-query";

export const journalResultQueryKey = (diaryId: number) =>
  ["journal", "result", diaryId] as const;

export const useJournalResult = (diaryId: number | undefined) => {
  return useQuery({
    queryKey: journalResultQueryKey(diaryId ?? 0),
    queryFn: () => {
      if (diaryId === undefined) {
        throw new Error("A valid diaryId is required.");
      }
      return fetchJournalResultApi(diaryId);
    },
    enabled: diaryId !== undefined,
    retry: 1,
  });
};

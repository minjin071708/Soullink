import { fetchJournalResultApi } from "@/api/journalApi";
import { useCanFetchAuthenticatedData } from "@/hooks/useCanFetchAuthenticatedData";
import { useQuery } from "@tanstack/react-query";

export const journalResultQueryKey = (diaryId: number) =>
  ["journal", "result", diaryId] as const;

export const useJournalResult = (diaryId: number | undefined) => {
  const canFetch = useCanFetchAuthenticatedData();

  return useQuery({
    queryKey: journalResultQueryKey(diaryId ?? 0),
    queryFn: () => {
      if (diaryId === undefined) {
        throw new Error("A valid diaryId is required.");
      }
      return fetchJournalResultApi(diaryId);
    },
    enabled: canFetch && diaryId !== undefined,
    retry: 1,
  });
};

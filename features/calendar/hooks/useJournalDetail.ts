import { fetchJournalResultApi } from "@/api/journalApi";
import { useCanFetchAuthenticatedData } from "@/hooks/useCanFetchAuthenticatedData";
import { useQuery } from "@tanstack/react-query";

export const journalDetailQueryKey = (diaryId: number) =>
  ["emotion-diary", "detail", diaryId] as const;

export function useJournalDetail(diaryId: number | undefined) {
  const canFetch = useCanFetchAuthenticatedData();

  return useQuery({
    queryKey: journalDetailQueryKey(diaryId ?? 0),
    queryFn: () => {
      if (diaryId === undefined) {
        throw new Error("A valid diaryId is required.");
      }
      return fetchJournalResultApi(diaryId);
    },
    enabled: canFetch && diaryId !== undefined,
    retry: 1,
  });
}

import { createJournalApi } from "@/api/journalApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createJournalApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["emotion-diaries", "range"],
      });
    },
  });
};

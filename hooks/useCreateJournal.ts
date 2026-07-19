import { createJournalApi } from "@/api/journalApi";
import { useMutation } from "@tanstack/react-query";

export const useCreateJournal = () => {
  return useMutation({
    mutationFn: createJournalApi,
    
  });
};

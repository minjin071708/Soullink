import { updateEmotionDiaryApi } from "@/api/journalApi";
import { journalByDateQueryKey } from "@/features/calendar/hooks/useJournalByDate";
import { journalDetailQueryKey } from "@/features/calendar/hooks/useJournalDetail";
import { journalResultQueryKey } from "@/hooks/useJournalResult";
import type { UpdateEmotionDiaryRequestType } from "@/types/journalType";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateEmotionDiary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      diaryId: number;
      payload: UpdateEmotionDiaryRequestType;
    }) => updateEmotionDiaryApi(params),
    onSuccess: (diary) => {
      queryClient.setQueryData(journalDetailQueryKey(diary.diaryId), diary);
      queryClient.setQueryData(journalResultQueryKey(diary.diaryId), diary);

      if (diary.emotionDate) {
        void queryClient.invalidateQueries({
          queryKey: journalByDateQueryKey(diary.emotionDate),
        });
      }

      void queryClient.invalidateQueries({
        queryKey: ["emotion-diaries", "range"],
      });
    },
  });
};

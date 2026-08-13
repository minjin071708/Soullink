import { createWeeklyAnalysisJobApi } from "@/api/analysisApi";
import { useMutation } from "@tanstack/react-query";

export const useCreateWeeklyAnalysisJob = () => {
  return useMutation({
    mutationFn: createWeeklyAnalysisJobApi,
    retry: false,
  });
};

import { createWeeklyAnalysisApi } from "@/api/analysisApi";
import { useMutation } from "@tanstack/react-query";

export const useCreateWeeklyAnalysis = () => {
  return useMutation({
    mutationFn: createWeeklyAnalysisApi,
    // Do not auto-retry: backend may still finish AI generation after client timeout.
    retry: false,
  });
};

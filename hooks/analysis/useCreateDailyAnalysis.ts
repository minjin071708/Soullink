import { createDailyAnalysisApi } from "@/api/analysisApi";
import { useMutation } from "@tanstack/react-query";

export const useCreateDailyAnalysis = () => {
  return useMutation({
    mutationFn: createDailyAnalysisApi,
    // Do not auto-retry: backend may continue generation after timeout.
    retry: false,
  });
};

import { createWeeklyAnalysisApi } from "@/api/analysisApi";
import type {
  CreateWeeklyAnalysisRequestType,
  WeeklyAnalysisData,
} from "@/types/analysisType";
import { useMutation } from "@tanstack/react-query";

export const useCreateWeeklyAnalysis = () => {
  return useMutation<
    WeeklyAnalysisData | null,
    Error,
    CreateWeeklyAnalysisRequestType
  >({
    mutationFn: createWeeklyAnalysisApi,
    // Do not auto-retry: backend may still finish AI generation after client timeout.
    retry: false,
  });
};

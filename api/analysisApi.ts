import { createWeeklyAnalysisResponseSchema } from "@/schemas/analysisSchema";
import type {
  CreateWeeklyAnalysisRequestType,
  WeeklyAnalysisData,
} from "@/types/analysisType";
import axiosInstance from "./axiosInstance";

/**
 * AI-002 POST /api/v1/ai-analyses/weekly
 * Returns parsed `data` only (not the full envelope).
 * Uses a request-only 60s timeout — does not change axiosInstance defaults.
 */
export const createWeeklyAnalysisApi = async (
  payload: CreateWeeklyAnalysisRequestType
): Promise<WeeklyAnalysisData> => {
  const response = await axiosInstance.post(
    "api/v1/ai-analyses/weekly",
    {
      baseDate: payload.baseDate,
      forceRegenerate: payload.forceRegenerate ?? false,
    },
    {
      timeout: 60_000,
    }
  );

  const parsed = createWeeklyAnalysisResponseSchema.parse(response.data);
  return parsed.data;
};

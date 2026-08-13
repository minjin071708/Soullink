import {
  createDailyAnalysisResponseSchema,
  createWeeklyAnalysisJobResponseSchema,
  createWeeklyAnalysisResponseSchema,
} from "@/schemas/analysisSchema";
import type {
  CreateDailyAnalysisRequestType,
  CreateWeeklyAnalysisJobResponse,
  CreateWeeklyAnalysisRequestType,
  DailyAnalysisData,
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

/**
 * AI-002 POST /api/v1/ai-analyses/weekly
 * Starts weekly analysis job and returns job execution metadata.
 */
export const createWeeklyAnalysisJobApi = async (
  payload: CreateWeeklyAnalysisRequestType
): Promise<CreateWeeklyAnalysisJobResponse["data"]> => {
  const response = await axiosInstance.post(
    "api/v1/ai-analyses/weekly",
    {
      ...(payload.baseDate ? { baseDate: payload.baseDate } : {}),
      forceRegenerate: payload.forceRegenerate ?? false,
    },
    {
      timeout: 60_000,
    }
  );

  const parsed = createWeeklyAnalysisJobResponseSchema.parse(response.data);
  return parsed.data;
};

/**
 * AI-001 POST /api/v1/ai-analyses/daily
 * Returns parsed `data` only (not the full envelope).
 */
export const createDailyAnalysisApi = async (
  payload: CreateDailyAnalysisRequestType
): Promise<DailyAnalysisData> => {
  const response = await axiosInstance.post(
    "api/v1/ai-analyses/daily",
    {
      diaryId: payload.diaryId,
      includeRecentContext: payload.includeRecentContext ?? true,
      forceRegenerate: payload.forceRegenerate ?? false,
    },
    {
      timeout: 60_000,
    }
  );

  const parsed = createDailyAnalysisResponseSchema.parse(response.data);
  return parsed.data;
};

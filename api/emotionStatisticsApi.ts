import {
  monthlyEmotionStatisticsResponseSchema,
  weeklyEmotionStatisticsResponseSchema,
} from "@/schemas/emotionStatisticsSchema";
import type {
  GetMonthlyEmotionStatisticsParams,
  GetWeeklyEmotionStatisticsRequest,
  MonthlyEmotionStatisticsData,
  WeeklyEmotionStatisticsData,
} from "@/types/emotionStatisticsType";
import axiosInstance from "./axiosInstance";

/**
 * GET /api/v1/emotion-statistics/weekly
 * Returns parsed `data` only (not the full envelope).
 */
export const getWeeklyEmotionStatisticsApi = async (
  params: GetWeeklyEmotionStatisticsRequest = {}
): Promise<WeeklyEmotionStatisticsData> => {
  const response = await axiosInstance.get(
    "api/v1/emotion-statistics/weekly",
    {
      params: {
        ...(params.baseDate ? { baseDate: params.baseDate } : {}),
      },
    }
  );

  const parsed = weeklyEmotionStatisticsResponseSchema.parse(response.data);
  return parsed.data;
};

/**
 * GET /api/v1/emotion-statistics/monthly
 * Returns parsed `data` only (not the full envelope).
 */
export const getMonthlyEmotionStatisticsApi = async (
  params: GetMonthlyEmotionStatisticsParams = {}
): Promise<MonthlyEmotionStatisticsData> => {
  const response = await axiosInstance.get(
    "api/v1/emotion-statistics/monthly",
    {
      params: {
        ...(params.baseDate ? { baseDate: params.baseDate } : {}),
      },
    }
  );

  const parsed = monthlyEmotionStatisticsResponseSchema.parse(response.data);
  return parsed.data;
};

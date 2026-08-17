import {
  monthlyStatisticsResponseSchema,
  weeklyStatisticsRequestSchema,
  weeklyStatisticsResponseSchema,
} from "@/schemas/emotionStatisticsSchema";
import type {
  GetMonthlyEmotionStatisticsParams,
  MonthlyStatisticsData,
  WeeklyStatisticsData,
  WeeklyStatisticsRequest,
} from "@/types/emotionStatisticsType";
import axiosInstance from "./axiosInstance";

/**
 * GET /api/v1/emotion-statistics/weekly
 * Returns parsed `data` only (not the full envelope).
 */
export const getWeeklyEmotionStatisticsApi = async (
  params: WeeklyStatisticsRequest = {}
): Promise<WeeklyStatisticsData> => {
  const query = weeklyStatisticsRequestSchema.parse(params);
  const response = await axiosInstance.get(
    "api/v1/emotion-statistics/weekly",
    {
      params: {
        ...(query.baseDate ? { baseDate: query.baseDate } : {}),
      },
    }
  );

  const parsed = weeklyStatisticsResponseSchema.parse(response.data);
  return parsed.data;
};

/**
 * GET /api/v1/emotion-statistics/monthly
 * Returns parsed `data` only (not the full envelope).
 */
export const getMonthlyEmotionStatisticsApi = async (
  params: GetMonthlyEmotionStatisticsParams = {}
): Promise<MonthlyStatisticsData> => {
  const response = await axiosInstance.get(
    "api/v1/emotion-statistics/monthly",
    {
      params: {
        ...(params.baseDate ? { baseDate: params.baseDate } : {}),
      },
    }
  );

  const parsed = monthlyStatisticsResponseSchema.parse(response.data);
  return parsed.data;
};

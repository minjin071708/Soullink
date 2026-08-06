import { getWeeklyEmotionStatisticsApi } from "@/api/emotionStatisticsApi";
import type { GetWeeklyEmotionStatisticsRequest } from "@/types/emotionStatisticsType";
import { useQuery } from "@tanstack/react-query";

export const weeklyEmotionStatisticsQueryKey = (
  params: GetWeeklyEmotionStatisticsRequest = {}
) => ["emotion-statistics", "weekly", params] as const;

export const useWeeklyEmotionStatistics = (
  params: GetWeeklyEmotionStatisticsRequest = {},
  enabled = true
) => {
  return useQuery({
    queryKey: weeklyEmotionStatisticsQueryKey(params),
    queryFn: () => getWeeklyEmotionStatisticsApi(params),
    enabled,
    staleTime: 60 * 1000,
  });
};

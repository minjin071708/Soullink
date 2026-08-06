import { getMonthlyEmotionStatisticsApi } from "@/api/emotionStatisticsApi";
import type { GetMonthlyEmotionStatisticsParams } from "@/types/emotionStatisticsType";
import { useQuery } from "@tanstack/react-query";

export const monthlyEmotionStatisticsQueryKey = (
  params: GetMonthlyEmotionStatisticsParams = {}
) => ["emotion-statistics", "monthly", params] as const;

export const useMonthlyEmotionStatistics = (
  params: GetMonthlyEmotionStatisticsParams = {},
  enabled = true
) => {
  return useQuery({
    queryKey: monthlyEmotionStatisticsQueryKey(params),
    queryFn: () => getMonthlyEmotionStatisticsApi(params),
    enabled,
    staleTime: 60 * 1000,
  });
};

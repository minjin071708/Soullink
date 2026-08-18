import { getMonthlyEmotionStatisticsApi } from "@/api/emotionStatisticsApi";
import { useCanFetchAuthenticatedData } from "@/hooks/useCanFetchAuthenticatedData";
import type { GetMonthlyEmotionStatisticsParams } from "@/types/emotionStatisticsType";
import { useQuery } from "@tanstack/react-query";

export const monthlyEmotionStatisticsQueryKey = (
  params: GetMonthlyEmotionStatisticsParams = {}
) => ["emotion-statistics", "monthly", params] as const;

export const useMonthlyEmotionStatistics = (
  params: GetMonthlyEmotionStatisticsParams = {},
  enabled = true
) => {
  const canFetch = useCanFetchAuthenticatedData();

  return useQuery({
    queryKey: monthlyEmotionStatisticsQueryKey(params),
    queryFn: () => getMonthlyEmotionStatisticsApi(params),
    enabled: canFetch && enabled,
    staleTime: 60 * 1000,
  });
};

import { getWeeklyEmotionStatisticsApi } from "@/api/emotionStatisticsApi";
import { useCanFetchAuthenticatedData } from "@/hooks/useCanFetchAuthenticatedData";
import type { WeeklyStatisticsRequest } from "@/types/emotionStatisticsType";
import { useQuery } from "@tanstack/react-query";

export const weeklyEmotionStatisticsQueryKey = (
  params: WeeklyStatisticsRequest = {}
) => ["emotion-statistics", "weekly", params] as const;

export const useWeeklyEmotionStatistics = (
  params: WeeklyStatisticsRequest = {},
  enabled = true
) => {
  const canFetch = useCanFetchAuthenticatedData();

  return useQuery({
    queryKey: weeklyEmotionStatisticsQueryKey(params),
    queryFn: () => getWeeklyEmotionStatisticsApi(params),
    enabled: canFetch && enabled,
    staleTime: 60 * 1000,
  });
};

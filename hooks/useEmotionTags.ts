import { getEmotionTagsApi } from "@/api/emotionTagsApi";
import { useCanFetchAuthenticatedData } from "@/hooks/useCanFetchAuthenticatedData";
import { useQuery } from "@tanstack/react-query";

export const emotionTagsQueryKey = (categoryCode: string) =>
  ["emotion-tags", categoryCode] as const;

/** EMO-007 — master emotion tags (CAUSE by default). */
export function useEmotionTags(categoryCode = "CAUSE") {
  const canFetch = useCanFetchAuthenticatedData();

  return useQuery({
    queryKey: emotionTagsQueryKey(categoryCode),
    queryFn: () => getEmotionTagsApi(categoryCode),
    enabled: canFetch,
    staleTime: 1000 * 60 * 60,
  });
}

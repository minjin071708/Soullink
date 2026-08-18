import { getCommunityPostDetailApi } from "@/api/communityApi";
import { useCanFetchAuthenticatedData } from "@/hooks/useCanFetchAuthenticatedData";
import { useQuery } from "@tanstack/react-query";

export const communityPostDetailQueryKey = (postId: string) =>
  ["community-posts-detail", postId] as const;

export const useCommunityPostsDetail = (postId: string | undefined) => {
  const canFetch = useCanFetchAuthenticatedData();

  return useQuery({
    queryKey: communityPostDetailQueryKey(postId ?? ""),
    queryFn: () => getCommunityPostDetailApi(postId!),
    enabled: canFetch && Boolean(postId),
    staleTime: 60 * 1000,
  });
};
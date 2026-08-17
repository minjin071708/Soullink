import { getCommunityPostDetailApi } from "@/api/communityApi";
import { useQuery } from "@tanstack/react-query";

export const communityPostDetailQueryKey = (postId: string) =>
  ["community-posts-detail", postId] as const;

export const useCommunityPostsDetail = (postId: string | undefined) => {
  return useQuery({
    queryKey: communityPostDetailQueryKey(postId ?? ""),
    queryFn: () => getCommunityPostDetailApi(postId!),
    enabled: Boolean(postId),
    staleTime: 60 * 1000,
  });
};
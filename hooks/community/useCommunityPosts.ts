import { addCommunityPostApi, getCommunityPostsApi } from "@/api/communityApi";
import type {
  CreateCommunityPostRequest,
  GetCommunityPostsRequest,
} from "@/types/community";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const communityPostsQueryKey = (params: GetCommunityPostsRequest) =>
  ["community-posts", params] as const;

export const useCommunityPosts = (params: GetCommunityPostsRequest = {}) => {
  return useQuery({
    queryKey: communityPostsQueryKey(params),
    queryFn: () => getCommunityPostsApi(params),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

export const useAddCommunityPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["add-community-post"],
    mutationFn: (post: CreateCommunityPostRequest) => addCommunityPostApi(post),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
    },
  });
};

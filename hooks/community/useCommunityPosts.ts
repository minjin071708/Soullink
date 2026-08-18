import {
  addCommunityPostApi,
  deleteCommunityPostApi,
  getCommunityPostsApi,
  updateCommunityPostApi,
} from "@/api/communityApi";
import { useCanFetchAuthenticatedData } from "@/hooks/useCanFetchAuthenticatedData";
import type {
  CommunityCategory,
  CommunitySort,
  CreateCommunityPostRequest,
  UpdateCommunityPostRequest,
} from "@/types/community";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type CommunityPostsQueryParams = {
  categoryCode?: CommunityCategory;
  sort?: CommunitySort;
  size?: number;
};

const DEFAULT_SORT: CommunitySort = "LATEST";
const DEFAULT_SIZE = 20;

function resolvePageSize(size: number | undefined): number {
  return Math.min(100, Math.max(1, size ?? DEFAULT_SIZE));
}

export const communityPostsQueryKey = (params: {
  categoryCode?: CommunityCategory;
  sort: CommunitySort;
  size: number;
}) => ["community-posts", params] as const;

export const useCommunityPosts = (
  params: CommunityPostsQueryParams = {}
) => {
  const sort = params.sort ?? DEFAULT_SORT;
  const size = resolvePageSize(params.size);
  const categoryCode = params.categoryCode;
  const canFetch = useCanFetchAuthenticatedData();

  return useInfiniteQuery({
    queryKey: communityPostsQueryKey({ categoryCode, sort, size }),
    queryFn: ({ pageParam }) =>
      getCommunityPostsApi({
        categoryCode,
        sort,
        page: pageParam,
        size,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.data.hasNext ? lastPage.data.page + 1 : undefined,
    enabled: canFetch,
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

export const useUpdateCommunityPost = (postId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-community-post", postId],
    mutationFn: (payload: UpdateCommunityPostRequest) =>
      updateCommunityPostApi({ postId: postId!, payload }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      if (postId) {
        void queryClient.invalidateQueries({
          queryKey: ["community-posts-detail", postId],
        });
      }
    },
  });
};

export const useDeleteCommunityPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-community-post"],
    mutationFn: (postId: string) => deleteCommunityPostApi(postId),
    onSuccess: (_data, postId) => {
      void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      void queryClient.removeQueries({
        queryKey: ["community-posts-detail", postId],
      });
    },
  });
};

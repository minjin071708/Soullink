import {
  createCommunityCommentApi,
  deleteCommunityCommentApi,
  getCommunityCommentsApi,
  toggleCommunityCommentLikeApi,
  updateCommunityCommentApi,
} from "@/api/communityApi";
import type {
  CommunityComment,
  CreateCommunityCommentRequest,
  GetCommunityCommentsResponse,
  LikeToggleResponse,
  UpdateCommunityCommentRequest,
} from "@/types/community";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import axios from "axios";

const DEFAULT_SIZE = 50;

export const communityCommentsQueryKey = (postId: number, size: number) =>
  ["community-comments", postId, { size }] as const;

function applyLikeToCommentsCache(
  data: InfiniteData<GetCommunityCommentsResponse> | undefined,
  commentId: number,
  like: LikeToggleResponse["data"]
): InfiniteData<GetCommunityCommentsResponse> | undefined {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        content: page.data.content.map((comment) =>
          comment.commentId === commentId
            ? {
                ...comment,
                likedByMe: like.liked,
                likeCount: like.likeCount,
              }
            : comment
        ),
      },
    })),
  };
}

async function invalidateCommentRelatedQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: number
) {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: ["community-comments", postId],
    }),
    queryClient.invalidateQueries({
      queryKey: ["community-posts-detail", String(postId)],
    }),
    queryClient.invalidateQueries({ queryKey: ["community-posts"] }),
  ]);
}

export const useCommunityComments = (postId: number, size = DEFAULT_SIZE) => {
  const pageSize = Math.min(100, Math.max(1, size));

  return useInfiniteQuery({
    queryKey: communityCommentsQueryKey(postId, pageSize),
    queryFn: ({ pageParam }) =>
      getCommunityCommentsApi(postId, {
        page: pageParam,
        size: pageSize,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.data.hasNext ? lastPage.data.page + 1 : undefined,
    enabled: Number.isFinite(postId) && postId > 0,
    staleTime: 60 * 1000,
  });
};

export const useCreateCommunityComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-community-comment", postId],
    mutationFn: (request: CreateCommunityCommentRequest) =>
      createCommunityCommentApi(postId, request),
    onSuccess: async () => {
      await invalidateCommentRelatedQueries(queryClient, postId);
    },
  });
};

export const useUpdateCommunityComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-community-comment", postId],
    mutationFn: ({
      commentId,
      request,
    }: {
      commentId: number;
      request: UpdateCommunityCommentRequest;
    }) => updateCommunityCommentApi(commentId, request),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["community-comments", postId],
      }),
  });
};

export const useDeleteCommunityComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["delete-community-comment", postId],
    mutationFn: deleteCommunityCommentApi,
    onSuccess: async () => {
      await invalidateCommentRelatedQueries(queryClient, postId);
    },
  });
};

export const useToggleCommunityCommentLike = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCommunityCommentLikeApi,
    onSuccess: (response, commentId) => {
      queryClient.setQueriesData<InfiniteData<GetCommunityCommentsResponse>>(
        { queryKey: ["community-comments", postId] },
        (current) =>
          applyLikeToCommentsCache(current, commentId, response.data)
      );
    },
    onError: (error) => {
      const status = axios.isAxiosError(error)
        ? error.response?.status
        : undefined;
      const code = axios.isAxiosError(error)
        ? (error.response?.data as { code?: string } | undefined)?.code
        : undefined;

      if (status === 409 || code === "COMMUNITY_LIKE_CONFLICT") {
        void queryClient.invalidateQueries({
          queryKey: ["community-comments", postId],
        });
      }
    },
  });
};

export function flattenCommunityComments(
  data: InfiniteData<GetCommunityCommentsResponse> | undefined
): CommunityComment[] {
  return data?.pages.flatMap((page) => page.data.content) ?? [];
}

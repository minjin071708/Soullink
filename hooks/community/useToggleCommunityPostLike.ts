import { toggleCommunityPostLikeApi } from "@/api/communityApi";
import type {
  CommunityPost,
  CommunityPostDetail,
  GetCommunityPostsResponse,
  LikeToggleResponse,
} from "@/types/community";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import axios from "axios";

function applyLikeToPost<T extends Pick<CommunityPost, "likedByMe" | "likeCount">>(
  post: T,
  like: LikeToggleResponse["data"]
): T {
  return {
    ...post,
    likedByMe: like.liked,
    likeCount: like.likeCount,
  };
}

function applyLikeToListCache(
  data: InfiniteData<GetCommunityPostsResponse> | undefined,
  postId: number,
  like: LikeToggleResponse["data"]
): InfiniteData<GetCommunityPostsResponse> | undefined {
  if (!data) {
    return data;
  }

  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      data: {
        ...page.data,
        content: page.data.content.map((post) =>
          post.postId === postId ? applyLikeToPost(post, like) : post
        ),
      },
    })),
  };
}

export const useToggleCommunityPostLike = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["toggle-community-post-like", postId],
    mutationFn: () => toggleCommunityPostLikeApi(postId),
    onSuccess: (response) => {
      const like = response.data;

      queryClient.setQueriesData<InfiniteData<GetCommunityPostsResponse>>(
        { queryKey: ["community-posts"] },
        (current) => applyLikeToListCache(current, postId, like)
      );

      queryClient.setQueryData<CommunityPostDetail>(
        ["community-posts-detail", String(postId)],
        (current) => (current ? applyLikeToPost(current, like) : current)
      );
    },
    onError: (error) => {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const code = axios.isAxiosError(error)
        ? (error.response?.data as { code?: string } | undefined)?.code
        : undefined;

      if (status === 409 || code === "COMMUNITY_LIKE_CONFLICT") {
        void queryClient.invalidateQueries({ queryKey: ["community-posts"] });
        void queryClient.invalidateQueries({
          queryKey: ["community-posts-detail", String(postId)],
        });
      }
    },
  });
};

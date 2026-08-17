import {
  communityCommentListResponseSchema,
  communityCommentResponseSchema,
  communityPostDetailResponseSchema,
  createCommunityCommentRequestSchema,
  createCommunityReportRequestSchema,
  createCommunityReportResponseSchema,
  deleteCommunityPostResponseSchema,
  getCommunityPostsResponseSchema,
  likeToggleResponseSchema,
  updateCommunityCommentRequestSchema,
  updateCommunityPostRequestSchema,
} from "@/schemas/communitySchema";
import type {
  CommunityCommentResponse,
  CommunityPostDetail,
  CreateCommunityCommentRequest,
  CreateCommunityPostRequest,
  CreateCommunityReportRequest,
  CreateCommunityReportResponse,
  DeleteCommunityPostResponse,
  GetCommunityCommentsParams,
  GetCommunityCommentsResponse,
  GetCommunityPostsRequest,
  GetCommunityPostsResponse,
  LikeToggleResponse,
  UpdateCommunityCommentRequest,
  UpdateCommunityPostRequest,
} from "@/types/community";
import {
  cacheDirectory,
  writeAsStringAsync,
} from "expo-file-system/legacy";
import axiosInstance from "./axiosInstance";

function clampPageSize(size: number | undefined): number {
  const next = size ?? 20;
  return Math.min(100, Math.max(1, next));
}

/**
 * GET /api/v1/community/posts
 * Returns the parsed list envelope (`data.content` + pagination).
 */
export const getCommunityPostsApi = async (
  params: GetCommunityPostsRequest = {}
): Promise<GetCommunityPostsResponse> => {
  const query: GetCommunityPostsRequest = {
    sort: params.sort ?? "LATEST",
    page: params.page ?? 0,
    size: clampPageSize(params.size),
  };

  if (params.categoryCode) {
    query.categoryCode = params.categoryCode;
  }

  const response = await axiosInstance.get("api/v1/community/posts", {
    params: query,
  });

  return getCommunityPostsResponseSchema.parse(response.data);
};


/**
 * POST /api/v1/community/posts
 * multipart/form-data:
 * - `request` (application/json): categoryCode (required), content?, imageSortOrders?
 * - `images` (File[], optional): same part name repeated, max 5, each ≤ 5MB
 */
export const addCommunityPostApi = async (post: CreateCommunityPostRequest) => {
  const formData = new FormData();
  const images = (post.images ?? []).slice(0, 5);

  const requestData: {
    categoryCode: CreateCommunityPostRequest["categoryCode"];
    content?: string;
    imageSortOrders?: number[];
  } = {
    categoryCode: post.categoryCode,
  };

  const content = post.content?.trim();
  if (content) {
    requestData.content = content.slice(0, 10_000);
  }

  // Spec: if omitted, server assigns 0..n-1 in images order.
  // When client sends orders, they must match the images array (no duplicates).
  if (images.length > 0) {
    requestData.imageSortOrders =
      post.imageSortOrders?.slice(0, images.length) ??
      images.map((_, index) => index);
  }

  // RN FormData does not support Blob (causes status 0 / Network Error).
  // Write JSON to a temp file so the part gets Content-Type: application/json.
  const requestUri = `${cacheDirectory}community-post-request.json`;
  await writeAsStringAsync(requestUri, JSON.stringify(requestData));
  formData.append("request", {
    uri: requestUri,
    name: "request.json",
    type: "application/json",
  } as unknown as Blob);

  images.forEach((image) => {
    formData.append("images", {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as unknown as Blob);
  });

  const response = await axiosInstance.post(
    "api/v1/community/posts",
    formData,
    { timeout: 60_000 }
  );

  return response.data;
};


export const getCommunityPostDetailApi = async (
  postId: string
): Promise<CommunityPostDetail> => {
  const response = await axiosInstance.get(
    `api/v1/community/posts/${postId}`
  );
  const parsed = communityPostDetailResponseSchema.parse(response.data);
  return parsed.data;
};

export const updateCommunityPostApi = async (params: {
  postId: string;
  payload: UpdateCommunityPostRequest;
}): Promise<CommunityPostDetail> => {
  const body = updateCommunityPostRequestSchema.parse(params.payload);
  const response = await axiosInstance.patch(
    `api/v1/community/posts/${params.postId}`,
    body
  );
  const parsed = communityPostDetailResponseSchema.parse(response.data);
  return parsed.data;
};

export const deleteCommunityPostApi = async (
  postId: string
): Promise<DeleteCommunityPostResponse> => {
  const response = await axiosInstance.delete(
    `api/v1/community/posts/${postId}`
  );
  return deleteCommunityPostResponseSchema.parse(response.data);
};

export const toggleCommunityPostLikeApi = async (
  postId: number
): Promise<LikeToggleResponse> => {
  const response = await axiosInstance.post(
    `api/v1/community/posts/${postId}/like-toggle`
  );
  return likeToggleResponseSchema.parse(response.data);
};

export const createCommunityCommentApi = async (
  postId: number,
  request: CreateCommunityCommentRequest
): Promise<CommunityCommentResponse> => {
  const body = createCommunityCommentRequestSchema.parse(request);
  const response = await axiosInstance.post(
    `api/v1/community/posts/${postId}/comments`,
    body
  );
  return communityCommentResponseSchema.parse(response.data);
};

export const getCommunityCommentsApi = async (
  postId: number,
  params: GetCommunityCommentsParams = {}
): Promise<GetCommunityCommentsResponse> => {
  const response = await axiosInstance.get(
    `api/v1/community/posts/${postId}/comments`,
    {
      params: {
        page: params.page ?? 0,
        size: clampPageSize(params.size ?? 50),
      },
    }
  );
  return communityCommentListResponseSchema.parse(response.data);
};

export const updateCommunityCommentApi = async (
  commentId: number,
  request: UpdateCommunityCommentRequest
): Promise<CommunityCommentResponse> => {
  const body = updateCommunityCommentRequestSchema.parse(request);
  const response = await axiosInstance.patch(
    `api/v1/community/comments/${commentId}`,
    body
  );
  return communityCommentResponseSchema.parse(response.data);
};

export const deleteCommunityCommentApi = async (commentId: number) => {
  const response = await axiosInstance.delete(
    `api/v1/community/comments/${commentId}`
  );
  return response.data;
};

export const toggleCommunityCommentLikeApi = async (
  commentId: number
): Promise<LikeToggleResponse> => {
  const response = await axiosInstance.post(
    `api/v1/community/comments/${commentId}/like-toggle`
  );
  return likeToggleResponseSchema.parse(response.data);
};

export const createCommunityReportApi = async (
  request: CreateCommunityReportRequest
): Promise<CreateCommunityReportResponse> => {
  const body = createCommunityReportRequestSchema.parse(request);
  const response = await axiosInstance.post(
    "api/v1/community/reports",
    body
  );
  return createCommunityReportResponseSchema.parse(response.data);
};
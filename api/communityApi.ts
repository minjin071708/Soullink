import { getCommunityPostsResponseSchema } from "@/schemas/communitySchema";
import type {
  CommunityPost,
  CreateCommunityPostRequest,
  GetCommunityPostsRequest
} from "@/types/community";
import {
  cacheDirectory,
  writeAsStringAsync,
} from "expo-file-system/legacy";
import axiosInstance from "./axiosInstance";

/**
 * GET /api/v1/community/posts
 * Returns the parsed `data.content` post list.
 */
export const getCommunityPostsApi = async (
  params: GetCommunityPostsRequest = {}
): Promise<CommunityPost[]> => {
  const response = await axiosInstance.get("api/v1/community/posts", {
    params: {
      categoryCode: params.categoryCode,
      sort: params.sort ?? "LATEST",
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  });

  const parsed = getCommunityPostsResponseSchema.parse(response.data);
  return parsed.data.content;
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

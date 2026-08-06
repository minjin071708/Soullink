import { z } from "zod";

export const communityCategorySchema = z.enum(["COUNSEL", "KNOWLEDGE"]);

export const communitySortSchema = z.enum(["LATEST", "POPULAR"]);

/**
 * TODO: Replace field names/shapes with the real backend community post response.
 * Placeholder fields mirror the current Similar Stories UI so the app can type-check.
 */
export const communityPostSchema = z.object({
  // TODO: Replace with backend response
  postId: z.number().int().positive(),
  matchScore: z.number().min(0).max(100),
  imageUrls: z.array(z.string().min(1)).min(1),
  authorName: z.string(),
  authorAvatarUrl: z.string().nullable(),
  categoryCode: communityCategorySchema,
  categoryName: z.string(),
  createdAt: z.string(),
  title: z.string(),
  contentPreview: z.string(),
  likesCount: z.number().int().nonnegative(),
  commentsCount: z.number().int().nonnegative(),
  isLiked: z.boolean(),
  isBookmarked: z.boolean(),
});

/**
 * TODO: Replace pagination envelope with the real backend list response.
 */
export const getCommunityPostsResponseSchema = z.object({
  // TODO: Replace with backend response
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: z.object({
    content: z.array(communityPostSchema),
    page: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
  requestId: z.string(),
});

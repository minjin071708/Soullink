import { z } from "zod";

export const communityCategorySchema = z.enum(["COUNSEL", "KNOWLEDGE"]);

export const communitySortSchema = z.enum(["LATEST", "POPULAR"]);

export const communityAuthorSchema = z.object({
  memberId: z.union([z.string(), z.number()]).transform(String),
  nickname: z.string(),
  profileImageUrl: z.string().nullable().optional().default(null),
});

export const communityImageSchema = z.object({
  postImageId: z.number().int(),
  imageUrl: z.string().min(1),
  sortOrder: z.number().int().nonnegative().optional().default(0),
  width: z.number().nullable().optional().default(null),
  height: z.number().nullable().optional().default(null),
});

/**
 * COM-001 / COM-002 shared post shape (confirmed community API doc).
 */
export const communityPostSchema = z
  .object({
    postId: z.number().int().positive(),
    categoryCode: communityCategorySchema,
    content: z.string().nullable().optional().default(null),
    images: z.array(communityImageSchema).optional().default([]),
    imageCount: z.number().int().nonnegative().optional(),
    author: communityAuthorSchema,
    viewCount: z.number().int().nonnegative().optional().default(0),
    likeCount: z.number().int().nonnegative().optional().default(0),
    commentCount: z.number().int().nonnegative().optional().default(0),
    likedByMe: z.boolean().optional().default(false),
    createdAt: z.string(),
    updatedAt: z.string().optional().default(""),
  })
  .transform((post) => {
    const images = [...post.images].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );

    return {
      ...post,
      images,
      imageCount: post.imageCount ?? images.length,
      updatedAt: post.updatedAt || post.createdAt,
    };
  });

export const communityPostPageSchema = z.object({
  content: z.array(communityPostSchema),
  page: z.number().int().nonnegative().optional().default(0),
  size: z.number().int().positive().optional().default(20),
  totalElements: z.number().int().nonnegative().optional().default(0),
  totalPages: z.number().int().nonnegative().optional().default(0),
  first: z.boolean().optional().default(true),
  last: z.boolean().optional().default(true),
  hasNext: z.boolean().optional().default(false),
});

export const getCommunityPostsResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: communityPostPageSchema,
  requestId: z.string().nullable().optional().default(null),
});

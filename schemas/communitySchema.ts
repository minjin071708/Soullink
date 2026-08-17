import { z } from "zod";

export const communityCategorySchema = z.enum(["COUNSEL", "KNOWLEDGE"]);

export const communitySortSchema = z.enum(["LATEST", "POPULAR"]);

export const communityAuthorSchema = z.object({
  memberId: z.string().trim().min(1),
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

export const communityPostDetailSchema = z.object({
  postId: z.number(),
  categoryCode: communityCategorySchema,
  content: z.string().nullable(),
  images: z.array(
    z.object({
      postImageId: z.number(),
      imageUrl: z.string().url(),
      sortOrder: z.number(),
      width: z.number().nullable(),
      height: z.number().nullable(),
    })
  ),
  imageCount: z.number(),
  author: communityAuthorSchema,
  viewCount: z.number(),
  likeCount: z.number(),
  commentCount: z.number(),
  likedByMe: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const communityPostDetailResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: communityPostDetailSchema,
  requestId: z.string().nullable(),
});

export const updateCommunityPostRequestSchema = z.object({
  content: z.string().trim().max(10_000).nullable().optional(),
  categoryCode: communityCategorySchema.optional(),
});

export const deleteCommunityPostResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: z.unknown().nullable().optional(),
  requestId: z.string().nullable().optional().default(null),
});

export const likeToggleDataSchema = z.object({
  liked: z.boolean(),
  likeCount: z.number(),
});

export const likeToggleResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: likeToggleDataSchema,
  requestId: z.string().nullable(),
});

export const communityCommentSchema = z.object({
  commentId: z.number().int().positive(),
  content: z.string(),
  author: communityAuthorSchema,
  likeCount: z.number().int().nonnegative().optional().default(0),
  likedByMe: z.boolean().optional().default(false),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const communityCommentPageSchema = z.object({
  content: z.array(communityCommentSchema),
  page: z.number().int().nonnegative().optional().default(0),
  size: z.number().int().positive().optional().default(50),
  totalElements: z.number().int().nonnegative().optional().default(0),
  totalPages: z.number().int().nonnegative().optional().default(0),
  first: z.boolean().optional().default(true),
  last: z.boolean().optional().default(true),
  hasNext: z.boolean().optional().default(false),
});

export const communityCommentResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: communityCommentSchema,
  requestId: z.string().nullable().optional().default(null),
});

export const communityCommentListResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: communityCommentPageSchema,
  requestId: z.string().nullable().optional().default(null),
});

export const createCommunityCommentRequestSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

export const updateCommunityCommentRequestSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

export const communityReportTargetTypeSchema = z.enum(["POST", "COMMENT"]);

export const communityReportReasonCodeSchema = z.enum([
  "ABUSE",
  "SPAM",
  "SEXUAL",
  "PERSONAL",
  "SELF_HARM",
  "OTHER",
]);

export const createCommunityReportRequestSchema = z
  .object({
    targetType: communityReportTargetTypeSchema,
    targetId: z.number().positive(),
    reasonCode: communityReportReasonCodeSchema,
    detailContent: z.string().max(1000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.reasonCode === "OTHER" && !value.detailContent?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["detailContent"],
        message: "OTHER requires detailContent",
      });
    }
  });

export const communityReportSchema = z.object({
  reportId: z.number(),
  targetType: communityReportTargetTypeSchema,
  targetId: z.number(),
  reasonCode: communityReportReasonCodeSchema,
  detailContent: z.string().nullable(),
  status: z.enum(["RECEIVED", "REVIEWING", "ACCEPTED", "REJECTED"]),
});

export const createCommunityReportResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: communityReportSchema,
  requestId: z.string().nullable().optional().default(null),
});

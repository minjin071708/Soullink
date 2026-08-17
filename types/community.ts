import { z } from "zod";
import {
  communityAuthorSchema,
  communityCategorySchema,
  communityImageSchema,
  communityPostDetailResponseSchema,
  communityPostDetailSchema,
  communityPostPageSchema,
  communityPostSchema,
  communitySortSchema,
  deleteCommunityPostResponseSchema,
  getCommunityPostsResponseSchema,
  communityCommentListResponseSchema,
  communityCommentResponseSchema,
  communityCommentSchema,
  createCommunityCommentRequestSchema,
  createCommunityReportRequestSchema,
  createCommunityReportResponseSchema,
  communityReportReasonCodeSchema,
  communityReportSchema,
  communityReportTargetTypeSchema,
  likeToggleResponseSchema,
  updateCommunityCommentRequestSchema,
  updateCommunityPostRequestSchema,
} from "../schemas/communitySchema";

export type CommunityCategory = z.infer<typeof communityCategorySchema>;
export type CommunitySort = z.infer<typeof communitySortSchema>;
export type CommunityAuthor = z.infer<typeof communityAuthorSchema>;
export type CommunityImage = z.infer<typeof communityImageSchema>;
export type CommunityPost = z.infer<typeof communityPostSchema>;
export type CommunityPostPage = z.infer<typeof communityPostPageSchema>;
export type GetCommunityPostsResponse = z.infer<
  typeof getCommunityPostsResponseSchema
>;
export type CommunityPostDetail = z.infer<typeof communityPostDetailSchema>;
export type GetCommunityPostDetailResponse = z.infer<
  typeof communityPostDetailResponseSchema
>;
export type UpdateCommunityPostRequest = z.infer<
  typeof updateCommunityPostRequestSchema
>;
export type DeleteCommunityPostResponse = z.infer<
  typeof deleteCommunityPostResponseSchema
>;
export type LikeToggleResponse = z.infer<typeof likeToggleResponseSchema>;
export type CommunityComment = z.infer<typeof communityCommentSchema>;
export type CommunityCommentResponse = z.infer<
  typeof communityCommentResponseSchema
>;
export type GetCommunityCommentsResponse = z.infer<
  typeof communityCommentListResponseSchema
>;
export type CreateCommunityCommentRequest = z.infer<
  typeof createCommunityCommentRequestSchema
>;
export type UpdateCommunityCommentRequest = z.infer<
  typeof updateCommunityCommentRequestSchema
>;
export type CommunityReportTargetType = z.infer<
  typeof communityReportTargetTypeSchema
>;
export type CommunityReportReasonCode = z.infer<
  typeof communityReportReasonCodeSchema
>;
export type CreateCommunityReportRequest = z.infer<
  typeof createCommunityReportRequestSchema
>;
export type CommunityReport = z.infer<typeof communityReportSchema>;
export type CreateCommunityReportResponse = z.infer<
  typeof createCommunityReportResponseSchema
>;

export type GetCommunityCommentsParams = {
  page?: number;
  size?: number;
};

export type GetCommunityPostsRequest = {
  categoryCode?: CommunityCategory;
  sort?: CommunitySort;
  page?: number;
  size?: number;
};

type UploadImage = {
  uri: string;
  name: string;
  type: string;
};

export type CreateCommunityPostRequest = {
  content?: string;
  categoryCode: CommunityCategory;
  imageSortOrders?: number[];
  images?: UploadImage[];
};

export type CreateCommunityPostResponse = {
  id: string;
  content: string;
  categoryCode: CommunityCategory;
  imageSortOrders: number[];
  images: UploadImage[];
};

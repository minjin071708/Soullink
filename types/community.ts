import { z } from "zod";
import {
  communityCategorySchema,
  communityPostSchema,
  communitySortSchema,
  getCommunityPostsResponseSchema,
} from "../schemas/communitySchema";

export type CommunityCategory = z.infer<typeof communityCategorySchema>;
export type CommunitySort = z.infer<typeof communitySortSchema>;
export type CommunityPost = z.infer<typeof communityPostSchema>;
export type GetCommunityPostsResponse = z.infer<
  typeof getCommunityPostsResponseSchema
>;


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
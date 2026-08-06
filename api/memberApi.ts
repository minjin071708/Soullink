import {
  memberMeResponseSchema,
  updateMemberRequestSchema,
} from "@/schemas/authSchema";
import type {
  MemberMeResponseType,
  MemberType,
  UpdateMemberRequestType,
} from "@/types/authType";
import axiosInstance from "./axiosInstance";

/**
 * GET /api/v1/members/me
 * Returns the authenticated member profile (`data`).
 */
export const fetchMemberMeApi = async (): Promise<MemberType> => {
  const response = await axiosInstance.get<MemberMeResponseType>(
    "api/v1/members/me"
  );

  const parsed = memberMeResponseSchema.parse(response.data);
  return parsed.data;
};

/**
 * PATCH /api/v1/members/me
 * Backend stores language as uppercase `languageCode` (e.g. KO / MN / EN).
 */
export const updateMemberMeApi = async (
  payload: UpdateMemberRequestType
): Promise<MemberType> => {
  const body = updateMemberRequestSchema.parse(payload);
  const languageCode = body.preferredLanguageCode.toUpperCase();

  const response = await axiosInstance.patch<MemberMeResponseType>(
    "api/v1/members/me",
    {
      nickname: body.nickname,
      languageCode,
      preferredLanguageCode: languageCode,
    }
  );

  const parsed = memberMeResponseSchema.parse(response.data);
  return parsed.data;
};

export type ProfileImageUpload = {
  uri: string;
  name: string;
  type: string;
};

/**
 * POST /api/v1/members/me/profile-image
 * multipart field: `file` (jpg/jpeg/png/webp, max 5MB)
 */
export const uploadMemberProfileImageApi = async (
  image: ProfileImageUpload
): Promise<MemberType> => {
  const formData = new FormData();
  formData.append("file", {
    uri: image.uri,
    name: image.name,
    type: image.type,
  } as unknown as Blob);

  const response = await axiosInstance.post(
    "api/v1/members/me/profile-image",
    formData,
    { timeout: 60_000 }
  );

  const parsed = memberMeResponseSchema.safeParse(response.data);
  if (parsed.success) {
    return parsed.data.data;
  }

  return fetchMemberMeApi();
};

/**
 * DELETE /api/v1/members/me/profile-image
 */
export const deleteMemberProfileImageApi = async (): Promise<MemberType> => {
  const response = await axiosInstance.delete(
    "api/v1/members/me/profile-image"
  );

  const parsed = memberMeResponseSchema.safeParse(response.data);
  if (parsed.success) {
    return parsed.data.data;
  }

  return fetchMemberMeApi();
};

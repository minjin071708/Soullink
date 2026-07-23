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
 * Trims and validates editable profile fields before sending.
 */
export const updateMemberMeApi = async (
  payload: UpdateMemberRequestType
): Promise<MemberType> => {
  const body = updateMemberRequestSchema.parse(payload);
  const response = await axiosInstance.patch<MemberMeResponseType>(
    "api/v1/members/me",
    body
  );

  const parsed = memberMeResponseSchema.parse(response.data);
  return parsed.data;
};

import {
  socialLoginResponseSchema,
  socialSignupResponseSchema,
} from "@/schemas/authSchema";
import type {
  SocialLoginRequestType,
  SocialLoginResponseType,
  SocialSignupRequestType,
  SocialSignupResponseType,
} from "@/types/authType";
import type { AxiosRequestConfig } from "axios";
import axiosInstance from "./axiosInstance";
import { normalizeTokenPayload } from "./normalizeAuthPayload";

type AuthRequestConfig = AxiosRequestConfig & {
  skipAuthRefresh?: boolean;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function normalizeSocialLoginPayload(
  raw: Record<string, unknown>
): Record<string, unknown> {
  const data = asRecord(raw.data) ?? {};

  if (data.signupRequired === true) {
    return {
      success: raw.success,
      code: raw.code,
      message: raw.message,
      requestId: raw.requestId ?? "",
      data: {
        loginStatus: data.loginStatus ?? "SIGNUP_REQUIRED",
        signupRequired: true,
        socialSignupToken: data.socialSignupToken,
        socialSignupTokenExpiresIn: data.socialSignupTokenExpiresIn,
        suggestedNickname: data.suggestedNickname ?? null,
      },
    };
  }

  const normalized = normalizeTokenPayload(raw);
  const normalizedData = asRecord(normalized.data) ?? {};

  return {
    ...normalized,
    data: {
      ...normalizedData,
      loginStatus: data.loginStatus ?? "LOGIN_SUCCESS",
      signupRequired: false,
      newMember: data.newMember ?? false,
    },
  };
}

export const socialLoginApi = async (
  body: SocialLoginRequestType
): Promise<SocialLoginResponseType> => {
  const config: AuthRequestConfig = { skipAuthRefresh: true };
  const response = await axiosInstance.post(
    "api/v1/auth/social/login",
    body,
    config
  );

  const normalized = normalizeSocialLoginPayload(
    response.data as Record<string, unknown>
  );

  return socialLoginResponseSchema.parse(normalized);
};

export const socialSignupApi = async (
  body: SocialSignupRequestType
): Promise<SocialSignupResponseType> => {
  const config: AuthRequestConfig = { skipAuthRefresh: true };
  const response = await axiosInstance.post(
    "api/v1/auth/social/signup",
    body,
    config
  );

  const normalized = normalizeTokenPayload(
    response.data as Record<string, unknown>
  );
  const data = asRecord(normalized.data) ?? {};
  const rawData = asRecord(
    (response.data as Record<string, unknown>)?.data
  );

  return socialSignupResponseSchema.parse({
    ...normalized,
    data: {
      ...data,
      loginStatus: rawData?.loginStatus ?? "LOGIN_SUCCESS",
      signupRequired: false,
      newMember: rawData?.newMember ?? true,
    },
  });
};

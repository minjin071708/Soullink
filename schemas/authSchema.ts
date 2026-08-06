import { z } from "zod";

export const memberSchema = z
  .object({
    memberNo: z.number(),
    memberId: z.string(),
    nickname: z.string().default(""),
    email: z.string().optional().default(""),
    preferredLanguageCode: z.string().optional().default(""),
    languageCode: z.string().optional(),
    memberStatus: z
      .enum(["ACTIVE", "INACTIVE", "SUSPENDED"])
      .default("ACTIVE"),
    marketingAgree: z.boolean().optional().default(false),
    profileImageUrl: z.string().nullish(),
    createdAt: z.string().optional().default(""),
    updatedAt: z.string().optional().default(""),
  })
  .transform((member) => {
    const raw =
      member.preferredLanguageCode || member.languageCode || "";
    const preferredLanguageCode = raw.trim().toLowerCase();
    const { languageCode: _languageCode, ...rest } = member;
    return {
      ...rest,
      preferredLanguageCode,
      profileImageUrl: rest.profileImageUrl?.trim() || null,
    };
  });

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  tokenType: z.string().default("Bearer"),
  accessTokenExpiresIn: z.number(),
  refreshTokenExpiresAt: z.string(),
});

export const loginDataSchema = authTokensSchema.extend({
  member: memberSchema.nullable(),
});

export const loginResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: loginDataSchema,
  requestId: z.string().optional().default(""),
});

export const refreshResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: authTokensSchema,
  requestId: z.string().optional().default(""),
});

/** GET /api/v1/members/me */
export const memberMeResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: memberSchema,
  requestId: z.string().optional().default(""),
});

export const preferredLanguageCodeSchema = z.enum(["en", "mn", "ko"]);

export const updateMemberRequestSchema = z.object({
  nickname: z.string().trim().min(1).max(50),
  preferredLanguageCode: preferredLanguageCodeSchema,
});

export const socialProviderSchema = z.enum(["GOOGLE", "APPLE"]);

export const deviceTypeSchema = z.enum(["ANDROID", "IOS"]);

export const socialLoginRequestSchema = z.object({
  provider: socialProviderSchema,
  idToken: z.string().min(1),
  nonce: z.string().nullable().optional(),
  displayName: z.string().nullable().optional(),
  deviceId: z.string().max(200).nullable().optional(),
  deviceType: deviceTypeSchema.nullable().optional(),
});

export const socialSignupRequestSchema = z.object({
  socialSignupToken: z.string().min(1),
  nickname: z.string().trim().min(1).max(30).optional(),
  serviceTermsAgree: z.literal(true),
  privacyAgree: z.literal(true),
  marketingAgree: z.boolean(),
  deviceId: z.string().max(200).nullable().optional(),
  deviceType: deviceTypeSchema.nullable().optional(),
});

export const socialLoginSuccessDataSchema = loginDataSchema.extend({
  loginStatus: z.literal("LOGIN_SUCCESS").optional(),
  signupRequired: z.literal(false),
  newMember: z.boolean().optional(),
});

export const socialSignupRequiredDataSchema = z.object({
  loginStatus: z.literal("SIGNUP_REQUIRED").optional(),
  signupRequired: z.literal(true),
  socialSignupToken: z.string().min(1),
  socialSignupTokenExpiresIn: z.number().optional(),
  suggestedNickname: z.string().nullable().optional(),
});

export const socialLoginDataSchema = z.discriminatedUnion("signupRequired", [
  socialLoginSuccessDataSchema,
  socialSignupRequiredDataSchema,
]);

export const socialLoginResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: socialLoginDataSchema,
  requestId: z.string().optional().default(""),
});

export const socialSignupResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: socialLoginSuccessDataSchema,
  requestId: z.string().optional().default(""),
});

/** @deprecated use authTokensSchema */
export const loginTokensSchema = authTokensSchema;

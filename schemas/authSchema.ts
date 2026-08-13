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

export const emailSignupRequestSchema = z
  .object({
    memberId: z
      .string()
      .trim()
      .min(4)
      .max(50)
      .regex(/^[A-Za-z0-9._-]+$/),

    email: z.string().trim().email().max(254),

    emailVerificationToken: z.string().min(1),

    password: z
      .string()
      .min(8)
      .max(64)
      .regex(/[A-Za-z]/)
      .regex(/[0-9]/),

    passwordConfirm: z.string().min(8).max(64),

    nickname: z.string().trim().min(1).max(30),
    serviceTermsAgree: z
    .boolean()
    .refine((value) => value === true, {
      message: "서비스 이용약관에 동의해 주세요.",
    }),
  
  privacyAgree: z
    .boolean()
    .refine((value) => value === true, {
      message: "개인정보 처리방침에 동의해 주세요.",
    }),
  
  marketingAgree: z.boolean(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않습니다.",
  });

  export const emailSignupResponseSchema = z.object({
    success: z.literal(true),
    code: z.string(),
    message: z.string(),
  
    data: z.object({
      memberNo: z.number().int().positive(),
      memberId: z.string(),
      nickname: z.string(),
      email: z.string().email(),
      memberStatus: z.literal("ACTIVE"),
      appleAppAccountToken: z.string().uuid(),
      createdAt: z.string(),
    }),
  
    requestId: z.string().uuid(),
  });

  // send email verification code

  export const sendEmailVerificationCodeRequestSchema = z.object({
    email: z.string().trim().email().max(254),
  });

  export const sendEmailVerificationCodeResponseSchema = z.object({
    success: z.literal(true),
    code: z.literal("EMAIL_VERIFICATION_SENT"),
    message: z.string(),
  
    data: z.object({
      verificationId: z.string().uuid(),
      maskedEmail: z.string(),
      expiresInSeconds: z.number().int().positive(),
      resendAvailableInSeconds: z.number().int().positive(),
    }),
  
    requestId: z.string(),
  });

  // verify email code

  export const verifyEmailCodeRequestSchema = z.object({
    verificationId: z.string().uuid(),
  
    email: z.string().trim().email().max(254),
  
    code: z.string().regex(/^\d{6}$/),
  });

  export const verifyEmailCodeResponseSchema = z.object({
    success: z.literal(true),
    code: z.string(),
    message: z.string(),
  
    data: z.object({
      verified: z.literal(true),
      emailVerificationToken: z.string().min(1),
      tokenExpiresInSeconds: z.number().int().positive(),
    }),
  
    requestId: z.string(),
  });
  
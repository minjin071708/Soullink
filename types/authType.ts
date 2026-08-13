import {
  authTokensSchema,
  deviceTypeSchema,
  emailSignupRequestSchema,
  emailSignupResponseSchema,
  loginResponseSchema,
  memberMeResponseSchema,
  memberSchema,
  sendEmailVerificationCodeRequestSchema,
  sendEmailVerificationCodeResponseSchema,
  socialLoginRequestSchema,
  socialLoginResponseSchema,
  socialProviderSchema,
  socialSignupRequestSchema,
  socialSignupResponseSchema,
  updateMemberRequestSchema,
  verifyEmailCodeRequestSchema,
  verifyEmailCodeResponseSchema,
} from "@/schemas/authSchema";
import { z } from "zod";

export type MemberType = z.infer<typeof memberSchema>;

export type LoginResponseType = z.infer<typeof loginResponseSchema>;

export type AuthTokensType = z.infer<typeof authTokensSchema>;

export type MemberMeResponseType = z.infer<typeof memberMeResponseSchema>;

export type UpdateMemberRequestType = z.infer<
  typeof updateMemberRequestSchema
>;

export type SocialProvider = z.infer<typeof socialProviderSchema>;

export type DeviceType = z.infer<typeof deviceTypeSchema>;

export type SocialLoginRequestType = z.infer<typeof socialLoginRequestSchema>;

export type SocialSignupRequestType = z.infer<typeof socialSignupRequestSchema>;

export type SocialLoginResponseType = z.infer<typeof socialLoginResponseSchema>;

export type SocialSignupResponseType = z.infer<
  typeof socialSignupResponseSchema
>;

export type LoginRequestType = {
  memberId: string;
  password: string;
};

export type RefreshRequestType = {
  refreshToken: string;
};

export type SendEmailVerificationCodeRequest = z.infer<typeof sendEmailVerificationCodeRequestSchema>;
export type SendEmailVerificationCodeResponse = z.infer<typeof sendEmailVerificationCodeResponseSchema>;
export type SendEmailVerificationCodeData = SendEmailVerificationCodeResponse["data"];

export type VerifyEmailCodeRequest = z.infer<typeof verifyEmailCodeRequestSchema>;
export type VerifyEmailCodeResponse = z.infer<typeof verifyEmailCodeResponseSchema>;
export type VerifyEmailCodeData = VerifyEmailCodeResponse["data"];

export type EmailSignupRequest = z.infer<typeof emailSignupRequestSchema>;
export type EmailSignupResponse = z.infer<typeof emailSignupResponseSchema>;
export type EmailSignupData = EmailSignupResponse["data"];
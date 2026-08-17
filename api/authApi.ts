import { emailSignupResponseSchema, loginResponseSchema, logoutRequestSchema, logoutResponseSchema, sendEmailVerificationCodeResponseSchema, verifyEmailCodeResponseSchema } from "@/schemas/authSchema";
import type { LoginRequestType, LoginResponseType, LogoutRequest, LogoutResponse, SendEmailVerificationCodeRequest, SendEmailVerificationCodeResponse } from "@/types/authType";
import { EmailSignupRequest, EmailSignupResponse, VerifyEmailCodeRequest, VerifyEmailCodeResponse } from "@/types/authType";
import axiosInstance from "./axiosInstance";
import { normalizeTokenPayload } from "./normalizeAuthPayload";

export { normalizeTokenPayload } from "./normalizeAuthPayload";
export { refreshTokenApi } from "./refreshApi";
export { socialLoginApi, socialSignupApi } from "./socialAuthApi";

export const loginApi = async (
  loginData: LoginRequestType
): Promise<LoginResponseType> => {
  const response = await axiosInstance.post(
    "api/v1/auth/login",
    loginData
  );

  const normalized = normalizeTokenPayload(
    response.data as Record<string, unknown>
  );

  return loginResponseSchema.parse(normalized);
};

export const logoutApi = async (
  request: LogoutRequest
): Promise<LogoutResponse> => {
  const body = logoutRequestSchema.parse(request);
  const response = await axiosInstance.post("api/v1/auth/logout", body);
  return logoutResponseSchema.parse(response.data);
};

export const emailSignupApi = async (data: EmailSignupRequest): Promise<EmailSignupResponse> => {
  const response = await axiosInstance.post("api/v1/auth/signup", data);
  return emailSignupResponseSchema.parse(response.data);
};

export const sendEmailVerificationCodeApi = async (
  data: SendEmailVerificationCodeRequest
): Promise<SendEmailVerificationCodeResponse> => {
  const response = await axiosInstance.post(
    "api/v1/auth/email-verifications/send",
    data
  );

  return sendEmailVerificationCodeResponseSchema.parse(response.data);
};

export const verifyEmailCodeApi = async (data: VerifyEmailCodeRequest): Promise<VerifyEmailCodeResponse> => {
  const response = await axiosInstance.post("/api/v1/auth/email-verifications/verify", data);
  return verifyEmailCodeResponseSchema.parse(response.data);
};
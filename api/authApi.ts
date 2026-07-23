import { loginResponseSchema } from "@/schemas/authSchema";
import type { LoginRequestType, LoginResponseType } from "@/types/authType";
import type { AxiosRequestConfig } from "axios";
import axiosInstance from "./axiosInstance";
import { normalizeTokenPayload } from "./normalizeAuthPayload";

export { normalizeTokenPayload } from "./normalizeAuthPayload";
export { refreshTokenApi } from "./refreshApi";
export { socialLoginApi, socialSignupApi } from "./socialAuthApi";

type AuthRequestConfig = AxiosRequestConfig & {
  skipAuthRefresh?: boolean;
};

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

export const logoutApi = async (): Promise<void> => {
  const config: AuthRequestConfig = { skipAuthRefresh: true };
  await axiosInstance.post("api/v1/auth/logout", undefined, config);
};

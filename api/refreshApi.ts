import {
  authTokensSchema,
  refreshResponseSchema,
} from "@/schemas/authSchema";
import type { AuthTokensType, RefreshRequestType } from "@/types/authType";
import axios from "axios";
import { normalizeTokenPayload } from "./normalizeAuthPayload";

/** Bare client — avoids interceptor refresh loops */
const refreshClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const refreshTokenApi = async (
  body: RefreshRequestType
): Promise<AuthTokensType> => {
  const response = await refreshClient.post(
    "api/v1/auth/token/refresh",
    body
  );

  const normalized = normalizeTokenPayload(
    response.data as Record<string, unknown>
  );

  const parsed = refreshResponseSchema.parse(normalized);
  return authTokensSchema.parse(parsed.data);
};

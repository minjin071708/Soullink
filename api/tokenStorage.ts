import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "@/api/tokenManager";

/** Backward-compatible facade used by older imports */
export const tokenStorage = {
  saveTokens,
  getAccessToken,
  getRefreshToken,
  removeTokens: clearTokens,
};

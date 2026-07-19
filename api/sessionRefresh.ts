import { refreshTokenApi } from "@/api/refreshApi";
import {
  clearTokens,
  getRefreshToken,
  saveTokens,
} from "@/api/tokenManager";
import { useAuthStore } from "@/store/authStore";

let refreshPromise: Promise<string> | null = null;

/**
 * Single-flight session refresh using stored refreshToken.
 * Rotates tokens in SecureStore on success.
 */
export async function refreshSession(): Promise<string> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const storedRefreshToken = await getRefreshToken();
    if (!storedRefreshToken) {
      throw new Error("No refresh token");
    }

    const tokens = await refreshTokenApi({
      refreshToken: storedRefreshToken,
    });

    await saveTokens(tokens.accessToken, tokens.refreshToken);
    return tokens.accessToken;
  })();

  try {
    return await refreshPromise;
  } catch (error) {
    await clearTokens();
    useAuthStore.getState().clearAuth();
    throw error;
  } finally {
    refreshPromise = null;
  }
}

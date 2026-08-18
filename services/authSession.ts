import { refreshSession } from "@/api/sessionRefresh";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from "@/api/tokenManager";
import {
  getBiometricCapability,
  promptBiometricUnlock,
} from "@/services/biometricService";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/use-language-store";

export async function clearLocalSession(): Promise<void> {
  await clearTokens();
  useAuthStore.getState().clearAuth();
}

async function restoreSessionFromStoredTokens(): Promise<
  "authenticated" | "unauthenticated"
> {
  const { setAuthenticated, setHasCompletedBootstrap } =
    useAuthStore.getState();

  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      await clearLocalSession();
      setHasCompletedBootstrap(true);
      return "unauthenticated";
    }

    await refreshSession();
    setAuthenticated(true);
    setHasCompletedBootstrap(true);
    return "authenticated";
  } catch {
    await clearLocalSession();
    setHasCompletedBootstrap(true);
    return "unauthenticated";
  }
}

/**
 * Biometric gate then refresh session with stored refreshToken.
 * Cancel/fail keeps tokens and leaves status = locked.
 */
export async function unlockWithBiometric(): Promise<
  "authenticated" | "locked" | "unauthenticated"
> {
  const { setStatus, setAuthenticated, setHasCompletedBootstrap } =
    useAuthStore.getState();

  const capability = await getBiometricCapability();
  if (!capability.isAvailable) {
    return restoreSessionFromStoredTokens();
  }

  const biometric = await promptBiometricUnlock(
    "Unlock SoulLink to continue"
  );

  if (!biometric.success) {
    if (biometric.reason === "unavailable") {
      return restoreSessionFromStoredTokens();
    }

    setStatus("locked");
    setHasCompletedBootstrap(true);
    return "locked";
  }

  try {
    await refreshSession();
    setAuthenticated(true);
    setHasCompletedBootstrap(true);
    return "authenticated";
  } catch {
    await clearLocalSession();
    setHasCompletedBootstrap(true);
    return "unauthenticated";
  }
}

export async function bootstrapAuthSession(): Promise<void> {
  const {
    isAuthenticated,
    setStatus,
    setHasCompletedBootstrap,
    setAccessToken,
    clearAuth,
  } = useAuthStore.getState();

  if (isAuthenticated) {
    const storedAccessToken = await getAccessToken();
    setAccessToken(storedAccessToken);
    setStatus("authenticated");
    setHasCompletedBootstrap(true);
    return;
  }

  setStatus("bootstrapping");

  try {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      clearAuth();
      setHasCompletedBootstrap(true);
      return;
    }

    const biometricUnlockEnabled =
      useAppStore.getState().biometricUnlockEnabled;
    const capability = await getBiometricCapability();

    if (biometricUnlockEnabled && capability.isAvailable) {
      setStatus("locked");
      await unlockWithBiometric();
      return;
    }

    await restoreSessionFromStoredTokens();
  } catch {
    await clearLocalSession();
    setHasCompletedBootstrap(true);
  }
}

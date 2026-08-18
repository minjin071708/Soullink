import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/use-language-store";

/**
 * Gate for protected GET queries.
 * - `hasHydrated`: Zustand persist (AsyncStorage) has finished restoring.
 * - `isLoggedIn`: in-memory session is authenticated (`useAuthStore.isAuthenticated`).
 * - `accessToken`: SecureStore token mirrored into the auth store after save/refresh.
 */
export function useCanFetchAuthenticatedData() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);

  return hasHydrated && isLoggedIn && Boolean(accessToken);
}

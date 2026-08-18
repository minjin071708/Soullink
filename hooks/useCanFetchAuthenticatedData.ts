import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/use-language-store";

/**
 * Gate for protected GET queries.
 * Axios reads the access token from SecureStore, so this only waits for
 * persisted app settings and an authenticated session.
 */
export function useCanFetchAuthenticatedData() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated);

  return hasHydrated && isLoggedIn;
}

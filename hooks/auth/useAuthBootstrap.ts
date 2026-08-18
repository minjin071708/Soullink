import { bootstrapAuthSession } from "@/services/authSession";
import { useAuthStore } from "@/store/authStore";
import { useAppStore } from "@/store/use-language-store";
import { useEffect, useRef } from "react";

/**
 * Runs once after persisted settings hydrate.
 * Does not re-prompt biometric while the JS session is already authenticated.
 */
export function useAuthBootstrap() {
  const status = useAuthStore((s) => s.status);
  const hasCompletedBootstrap = useAuthStore((s) => s.hasCompletedBootstrap);
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!hasHydrated || startedRef.current) {
      return;
    }
    startedRef.current = true;
    void bootstrapAuthSession();
  }, [hasHydrated]);

  return { status, hasCompletedBootstrap };
}

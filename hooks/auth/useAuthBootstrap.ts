import { bootstrapAuthSession } from "@/services/authSession";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef } from "react";

/**
 * Runs once on cold start / first mount.
 * Does not re-prompt biometric while the JS session is already authenticated.
 */
export function useAuthBootstrap() {
  const status = useAuthStore((s) => s.status);
  const hasCompletedBootstrap = useAuthStore((s) => s.hasCompletedBootstrap);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    void bootstrapAuthSession();
  }, []);

  return { status, hasCompletedBootstrap };
}

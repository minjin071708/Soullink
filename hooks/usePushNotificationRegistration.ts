import { registerPushDeviceApi } from "@/api/pushNotificationApi";
import { createPushDeviceRegistration } from "@/services/pushNotificationService";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef } from "react";

/**
 * Registers this install for push after auth bootstrap and login.
 * Failures are non-blocking and never clear the session.
 */
export function usePushNotificationRegistration() {
  const hasCompletedBootstrap = useAuthStore(
    (state) => state.hasCompletedBootstrap
  );
  const isLoggedIn = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasAttemptedPushRegistrationRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || !accessToken) {
      hasAttemptedPushRegistrationRef.current = false;
    }
  }, [isLoggedIn, accessToken]);

  useEffect(() => {
    if (
      !hasCompletedBootstrap ||
      !isLoggedIn ||
      !accessToken ||
      hasAttemptedPushRegistrationRef.current
    ) {
      return;
    }

    hasAttemptedPushRegistrationRef.current = true;

    let cancelled = false;

    const initializePushNotifications = async () => {
      try {
        const registration = await createPushDeviceRegistration();

        if (!registration || cancelled) {
          return;
        }

        await registerPushDeviceApi(registration);

        if (__DEV__) {
          console.log("Push device registered:", {
            deviceId: registration.deviceId,
            deviceType: registration.deviceType,
            hasPushToken: Boolean(registration.pushToken),
          });
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("Push notification registration failed:", error);
        }
      }
    };

    void initializePushNotifications();

    return () => {
      cancelled = true;
    };
  }, [hasCompletedBootstrap, isLoggedIn, accessToken]);
}

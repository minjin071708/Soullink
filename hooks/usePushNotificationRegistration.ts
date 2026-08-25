import { registerPushDeviceApi } from "@/api/pushNotificationApi";
import { getAccessToken } from "@/api/tokenManager";
import { dailyAnalysisReadyPayloadSchema } from "@/schemas/pushNotificationSchema";
import { createPushDeviceRegistration } from "@/services/pushNotificationService";
import { useAuthStore } from "@/store/authStore";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";

function openDailyAnalysisFromNotification(data: unknown) {
  const parsed = dailyAnalysisReadyPayloadSchema.safeParse(data);
  if (!parsed.success) {
    if (__DEV__) {
      console.warn(
        "Invalid daily analysis notification payload:",
        parsed.error.flatten()
      );
    }
    return;
  }

  router.push({
    pathname: "/calendar/analysis/[date]",
    params: {
      date: parsed.data.emotionDate,
    },
  });
}

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
  const hasSucceededRef = useRef(false);
  const inFlightRef = useRef(false);
  const handledLastResponseRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn) {
      hasSucceededRef.current = false;
      inFlightRef.current = false;
      handledLastResponseRef.current = false;
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!hasCompletedBootstrap || !isLoggedIn) {
      return;
    }

    const register = async () => {
      if (hasSucceededRef.current || inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;

      try {
        const token = accessToken ?? (await getAccessToken());
        if (!token) {
          if (__DEV__) {
            console.warn("Push registration skipped: no access token yet");
          }
          return;
        }

        if (__DEV__) {
          console.log("Push registration: starting");
        }

        const registration = await createPushDeviceRegistration();
        if (!registration) {
          return;
        }

        console.warn("TEMP EXPO PUSH TOKEN:", registration.pushToken);

        await registerPushDeviceApi(registration);
        hasSucceededRef.current = true;

      } finally {
        inFlightRef.current = false;
      }
    };

    void register();

    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void register();
      }
    });

    return () => {
      appStateSub.remove();
    };
  }, [hasCompletedBootstrap, isLoggedIn, accessToken]);

  useEffect(() => {
    if (!hasCompletedBootstrap || !isLoggedIn) {
      return;
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        openDailyAnalysisFromNotification(
          response.notification.request.content.data
        );
      }
    );

    if (!handledLastResponseRef.current) {
      handledLastResponseRef.current = true;
      void Notifications.getLastNotificationResponseAsync().then((response) => {
        if (!response) {
          return;
        }
        openDailyAnalysisFromNotification(
          response.notification.request.content.data
        );
      });
    }

    return () => {
      subscription.remove();
    };
  }, [hasCompletedBootstrap, isLoggedIn]);
}

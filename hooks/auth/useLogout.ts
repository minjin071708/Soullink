import { logoutApi } from "@/api/authApi";
import { deactivatePushDeviceApi } from "@/api/pushNotificationApi";
import { clearTokens, getRefreshToken } from "@/api/tokenManager";
import { useAuthStore } from "@/store/authStore";
import { getOrCreateInstallationId } from "@/utils/deviceInstallation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, type Href } from "expo-router";

const LOGIN_HREF = "/(auth)/login" as Href;

export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const deviceId = await getOrCreateInstallationId();
        await deactivatePushDeviceApi(deviceId);
      } catch {
        // Missing/offline device must not block logout.
      }

      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return;
      }

      return logoutApi({
        refreshToken,
        allDevices: false,
      });
    },
    onSettled: async () => {
      await clearTokens();
      clearAuth();
      queryClient.clear();
      router.replace(LOGIN_HREF);
    },
  });
};

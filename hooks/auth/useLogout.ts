import { logoutApi } from "@/api/authApi";
import { clearTokens } from "@/api/tokenManager";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { router, type Href } from "expo-router";

const LOGIN_HREF = "/(auth)/login" as Href;

export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: async () => {
      await logoutApi();
    },
    onSettled: async () => {
      await clearTokens();
      clearAuth();
      router.replace(LOGIN_HREF);
    },
  });
};

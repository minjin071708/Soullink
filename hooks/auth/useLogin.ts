import { loginApi } from "@/api/authApi";
import { saveTokens } from "@/api/tokenManager";
import { useAuthStore } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";

export const useLogin = () => {
  const setMember = useAuthStore((state) => state.setMember);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: loginApi,

    onSuccess: async (response) => {
      const { member, accessToken, refreshToken } = response.data;

      await saveTokens(accessToken, refreshToken);

      if (member) {
        setMember(member);
      } else {
        setAuthenticated(true);
      }
    },
  });
};

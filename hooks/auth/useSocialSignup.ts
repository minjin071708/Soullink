import { socialSignupApi } from "@/api/authApi";
import { saveTokens } from "@/api/tokenManager";
import { useAuthStore } from "@/store/authStore";
import {
  clearSocialSignupPending,
  getSocialSignupPending,
} from "@/store/socialSignupStore";
import { getDeviceMeta } from "@/utils/deviceInfo";
import { useMutation } from "@tanstack/react-query";

export type SocialSignupInput = {
  nickname?: string;
  serviceTermsAgree: true;
  privacyAgree: true;
  marketingAgree: boolean;
};

export class SocialSignupSessionExpiredError extends Error {
  constructor() {
    super("Social signup session expired");
    this.name = "SocialSignupSessionExpiredError";
  }
}

export const useSocialSignup = () => {
  const setMember = useAuthStore((state) => state.setMember);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: async (input: SocialSignupInput) => {
      const pending = getSocialSignupPending();
      if (!pending) {
        throw new SocialSignupSessionExpiredError();
      }

      const { deviceId, deviceType } = await getDeviceMeta();

      const response = await socialSignupApi({
        socialSignupToken: pending.socialSignupToken,
        nickname: input.nickname,
        serviceTermsAgree: input.serviceTermsAgree,
        privacyAgree: input.privacyAgree,
        marketingAgree: input.marketingAgree,
        deviceId,
        deviceType,
      });

      await saveTokens(response.data.accessToken, response.data.refreshToken);
      clearSocialSignupPending();

      if (response.data.member) {
        setMember(response.data.member);
      } else {
        setAuthenticated(true);
      }

      return response;
    },
  });
};

import { socialLoginApi } from "@/api/authApi";
import { saveTokens } from "@/api/tokenManager";
import {
  signInWithApple,
  signInWithGoogle,
  SocialAuthCancelledError,
} from "@/services/socialAuth";
import { useAuthStore } from "@/store/authStore";
import {
  clearSocialSignupPending,
  setSocialSignupPending,
} from "@/store/socialSignupStore";
import type { SocialProvider } from "@/types/authType";
import { getDeviceMeta } from "@/utils/deviceInfo";
import { useMutation } from "@tanstack/react-query";

export type SocialLoginResult =
  | { kind: "authenticated" }
  | {
      kind: "signup_required";
      suggestedNickname: string | null;
    }
  | { kind: "cancelled" };

export const useSocialLogin = () => {
  const setMember = useAuthStore((state) => state.setMember);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  return useMutation({
    mutationFn: async (
      provider: SocialProvider
    ): Promise<SocialLoginResult> => {
      try {
        const credential =
          provider === "GOOGLE"
            ? await signInWithGoogle()
            : await signInWithApple();

        const { deviceId, deviceType } = await getDeviceMeta();

        const response = await socialLoginApi({
          provider: credential.provider,
          idToken: credential.idToken,
          nonce: credential.nonce,
          displayName: credential.displayName,
          deviceId,
          deviceType,
        });

        if (response.data.signupRequired) {
          setSocialSignupPending({
            socialSignupToken: response.data.socialSignupToken,
            suggestedNickname: response.data.suggestedNickname,
            expiresInSeconds: response.data.socialSignupTokenExpiresIn,
          });

          return {
            kind: "signup_required",
            suggestedNickname: response.data.suggestedNickname ?? null,
          };
        }

        clearSocialSignupPending();
        await saveTokens(
          response.data.accessToken,
          response.data.refreshToken
        );

        if (response.data.member) {
          setMember(response.data.member);
        } else {
          setAuthenticated(true);
        }

        return { kind: "authenticated" };
      } catch (error) {
        if (error instanceof SocialAuthCancelledError) {
          return { kind: "cancelled" };
        }
        throw error;
      }
    },
  });
};

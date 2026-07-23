import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useSocialLogin } from "@/hooks/auth/useSocialLogin";
import { SocialAuthConfigError } from "@/services/socialAuth";
import { useAppStore, type Language } from "@/store/use-language-store";
import type { SocialProvider } from "@/types/authType";
import { mapSocialAuthErrorMessage } from "@/utils/socialAuthErrors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, type Href } from "expo-router";
import { useCallback } from "react";

const TERMS_HREF = "/(auth)/terms" as Href;

const ERROR_TITLE: Record<Language, string> = {
  en: "Sign-in failed",
  mn: "Нэвтрэлт амжилтгүй",
  ko: "로그인 실패",
};

export function useSocialAuthActions() {
  const toast = useToast();
  const language = useAppStore((state) => state.language) ?? "mn";
  const { mutateAsync, isPending } = useSocialLogin();

  const showError = useCallback(
    (message: string) => {
      toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }) => (
          <Toast
            nativeID={`social-login-error-${id}`}
            action="error"
            variant="solid"
            className="px-14 py-6 gap-6 shadow-soft-1 flex-row bg-white"
          >
            <MaterialIcons name="error-outline" size={32} color="red" />
            <VStack space="xs">
              <ToastTitle size="md">{ERROR_TITLE[language]}</ToastTitle>
              <ToastDescription size="md">{message}</ToastDescription>
            </VStack>
          </Toast>
        ),
      });
    },
    [language, toast]
  );

  const startSocialAuth = useCallback(
    async (provider: SocialProvider) => {
      if (isPending) {
        return;
      }

      try {
        const result = await mutateAsync(provider);

        if (result.kind === "cancelled") {
          return;
        }

        if (result.kind === "signup_required") {
          router.push(TERMS_HREF);
          return;
        }

        router.replace("/(tabs)");
      } catch (error) {
        if (error instanceof SocialAuthConfigError) {
          showError(error.message);
          return;
        }

        showError(mapSocialAuthErrorMessage(error, language));
      }
    },
    [isPending, language, mutateAsync, showError]
  );

  return {
    isPending,
    startSocialAuth,
  };
}

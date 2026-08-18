import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import {
  SocialSignupSessionExpiredError,
  useSocialSignup,
} from "@/hooks/auth/useSocialSignup";
import { useAppStore, type Language } from "@/store/use-language-store";
import {
  clearSocialSignupPending,
  getSocialSignupPending,
} from "@/store/socialSignupStore";
import { mapSocialAuthErrorMessage } from "@/utils/socialAuthErrors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const APPLE_INK = "#1d1d1f";
const MUTED = "#6E6E73";
const SCREEN_GRADIENT = ["#f3edff", "#fff6f5"] as const;
const LOGIN_HREF = "/(auth)/login" as Href;

const COPY: Record<
  Language,
  {
    title: string;
    subtitle: string;
    nickname: string;
    nicknamePlaceholder: string;
    serviceTerms: string;
    privacy: string;
    marketing: string;
    requiredHint: string;
    submit: string;
    expiredTitle: string;
    expiredMessage: string;
    errorTitle: string;
  }
> = {
  EN: {
    title: "Agree to continue",
    subtitle: "Please review the terms to finish creating your account",
    nickname: "Nickname",
    nicknamePlaceholder: "How should we call you?",
    serviceTerms: "I agree to the Terms of Service (required)",
    privacy: "I agree to the Privacy Policy (required)",
    marketing: "I agree to receive marketing updates (optional)",
    requiredHint: "Required terms must be accepted",
    submit: "Create account",
    expiredTitle: "Session expired",
    expiredMessage: "Please sign in with Google or Apple again.",
    errorTitle: "Signup failed",
  },
  MN: {
    title: "Үргэлжлүүлэхийн тулд зөвшөөрнө үү",
    subtitle: "Бүртгэлээ дуусгахын тулд нөхцөлийг шалгана уу",
    nickname: "Хоч нэр",
    nicknamePlaceholder: "Таныг юу гэж дуудах вэ?",
    serviceTerms: "Үйлчилгээний нөхцөлийг зөвшөөрч байна (заавал)",
    privacy: "Нууцлалын бодлогыг зөвшөөрч байна (заавал)",
    marketing: "Маркетингийн мэдээлэл авахыг зөвшөөрч байна (сонголттой)",
    requiredHint: "Заавал нөхцөлийг зөвшөөрөх шаардлагатай",
    submit: "Бүртгэл үүсгэх",
    expiredTitle: "Хугацаа дууссан",
    expiredMessage: "Google эсвэл Apple-р дахин нэвтэрнэ үү.",
    errorTitle: "Бүртгэл амжилтгүй",
  },
  KO: {
    title: "약관 동의",
    subtitle: "계정을 만들려면 약관에 동의해 주세요",
    nickname: "닉네임",
    nicknamePlaceholder: "어떻게 불러드릴까요?",
    serviceTerms: "서비스 이용약관 동의 (필수)",
    privacy: "개인정보 처리방침 동의 (필수)",
    marketing: "마케팅 정보 수신 동의 (선택)",
    requiredHint: "필수 약관에 모두 동의해 주세요",
    submit: "계정 만들기",
    expiredTitle: "세션 만료",
    expiredMessage: "Google 또는 Apple로 다시 로그인해 주세요.",
    errorTitle: "가입 실패",
  },
};

export default function TermsAgreementScreen() {
  const toast = useToast();
  const language = useAppStore((state) => state.language) ?? "MN";
  const copy = COPY[language];
  const pending = useMemo(() => getSocialSignupPending(), []);

  const [nickname, setNickname] = useState(pending?.suggestedNickname ?? "");
  const [serviceTermsAgree, setServiceTermsAgree] = useState(false);
  const [privacyAgree, setPrivacyAgree] = useState(false);
  const [marketingAgree, setMarketingAgree] = useState(false);

  const { mutate: signup, isPending } = useSocialSignup();

  useEffect(() => {
    if (!pending) {
      toast.show({
        placement: "top",
        duration: 3000,
        render: ({ id }) => (
          <Toast
            nativeID={`signup-expired-${id}`}
            action="error"
            variant="solid"
            className="px-14 py-6 gap-6 shadow-soft-1 flex-row bg-white"
          >
            <MaterialIcons name="error-outline" size={32} color="red" />
            <VStack space="xs">
              <ToastTitle size="md">{copy.expiredTitle}</ToastTitle>
              <ToastDescription size="md">{copy.expiredMessage}</ToastDescription>
            </VStack>
          </Toast>
        ),
      });
      router.replace(LOGIN_HREF);
    }
  }, [pending, copy.expiredMessage, copy.expiredTitle, toast]);

  const canSubmit = serviceTermsAgree && privacyAgree && !isPending;

  const showError = (title: string, message: string) => {
    toast.show({
      placement: "top",
      duration: 3000,
      render: ({ id }) => (
        <Toast
          nativeID={`signup-error-${id}`}
          action="error"
          variant="solid"
          className="px-14 py-6 gap-6 shadow-soft-1 flex-row bg-white"
        >
          <MaterialIcons name="error-outline" size={32} color="red" />
          <VStack space="xs">
            <ToastTitle size="md">{title}</ToastTitle>
            <ToastDescription size="md">{message}</ToastDescription>
          </VStack>
        </Toast>
      ),
    });
  };

  const handleSubmit = () => {
    if (!serviceTermsAgree || !privacyAgree) {
      showError(copy.errorTitle, copy.requiredHint);
      return;
    }

    const trimmed = nickname.trim();

    signup(
      {
        nickname: trimmed.length > 0 ? trimmed : undefined,
        serviceTermsAgree: true,
        privacyAgree: true,
        marketingAgree,
      },
      {
        onSuccess: () => {
          router.replace("/(tabs)");
        },
        onError: (error) => {
          if (error instanceof SocialSignupSessionExpiredError) {
            clearSocialSignupPending();
            showError(copy.expiredTitle, copy.expiredMessage);
            router.replace(LOGIN_HREF);
            return;
          }

          showError(
            copy.errorTitle,
            mapSocialAuthErrorMessage(error, language)
          );
        },
      }
    );
  };

  if (!pending) {
    return null;
  }

  return (
    <LinearGradient
      colors={[...SCREEN_GRADIENT]}
      locations={[0, 1]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle}>{copy.subtitle}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>{copy.nickname}</Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder={copy.nicknamePlaceholder}
              placeholderTextColor="rgba(110,110,115,0.7)"
              maxLength={30}
              autoCapitalize="none"
              style={styles.input}
            />

            <CheckboxRow
              checked={serviceTermsAgree}
              label={copy.serviceTerms}
              onPress={() => setServiceTermsAgree((value) => !value)}
            />
            <CheckboxRow
              checked={privacyAgree}
              label={copy.privacy}
              onPress={() => setPrivacyAgree((value) => !value)}
            />
            <CheckboxRow
              checked={marketingAgree}
              label={copy.marketing}
              onPress={() => setMarketingAgree((value) => !value)}
            />
          </View>

          <View style={styles.spacer} />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={copy.submit}
            disabled={!canSubmit}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              !canSubmit && styles.submitDisabled,
              pressed && canSubmit && styles.pressed,
            ]}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitLabel}>{copy.submit}</Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function CheckboxRow({
  checked,
  label,
  onPress,
}: {
  checked: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={styles.checkboxRow}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? (
          <MaterialIcons name="check" size={16} color="#FFFFFF" />
        ) : null}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  header: {
    marginTop: 12,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: APPLE_INK,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: MUTED,
  },
  form: {
    marginTop: 32,
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: APPLE_INK,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    fontSize: 16,
    color: APPLE_INK,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(29,29,31,0.12)",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "rgba(29,29,31,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: APPLE_INK,
    borderColor: APPLE_INK,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: APPLE_INK,
  },
  spacer: {
    flex: 1,
  },
  submitButton: {
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: APPLE_INK,
    alignItems: "center",
    justifyContent: "center",
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});

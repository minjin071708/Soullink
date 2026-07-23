import { useSocialAuthActions } from "@/hooks/auth/useSocialAuthActions";
import { useAppStore, type Language } from "@/store/use-language-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const APPLE_INK = "#1d1d1f";
const MUTED = "#6E6E73";
const SCREEN_GRADIENT = ["#f3edff", "#fff6f5"] as const;
const EMAIL_LOGIN_HREF = "/(auth)/email-login" as Href;
const SIGNUP_HREF = "/(auth)/signup" as Href;

const COPY: Record<
  Language,
  {
    title: string;
    subtitle: string;
    google: string;
    apple: string;
    or: string;
    regularLogin: string;
    createAccount: string;
  }
> = {
  en: {
    title: "Welcome back",
    subtitle: "Sign in to continue your journal",
    google: "Continue with Google",
    apple: "Continue with Apple",
    or: "or",
    regularLogin: "Sign in with email",
    createAccount: "Create account",
  },
  mn: {
    title: "Тавтай морил",
    subtitle: "Журнал руугаа үргэлжлүүлэн нэвтэрнэ үү",
    google: "Google-р үргэлжлүүлэх",
    apple: "Apple-р үргэлжлүүлэх",
    or: "эсвэл",
    regularLogin: "Имэйлээр нэвтрэх",
    createAccount: "Бүртгэл үүсгэх",
  },
  ko: {
    title: "다시 오신 걸 환영해요",
    subtitle: "저널을 이어가려면 로그인해 주세요",
    google: "Google로 계속하기",
    apple: "Apple로 계속하기",
    or: "또는",
    regularLogin: "일반 로그인",
    createAccount: "계정 만들기",
  },
};

export default function LoginScreen() {
  const language = useAppStore((state) => state.language) ?? "mn";
  const copy = COPY[language];
  const { isPending, startSocialAuth } = useSocialAuthActions();

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

          <View style={styles.spacer} />

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.google}
              disabled={isPending}
              onPress={() => startSocialAuth("GOOGLE")}
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.pressed,
                isPending && styles.disabled,
              ]}
            >
              {isPending ? (
                <ActivityIndicator color={APPLE_INK} />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color={APPLE_INK} />
                  <Text style={styles.socialLabel}>{copy.google}</Text>
                </>
              )}
            </Pressable>

            {Platform.OS === "ios" ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={copy.apple}
                disabled={isPending}
                onPress={() => startSocialAuth("APPLE")}
                style={({ pressed }) => [
                  styles.socialButton,
                  styles.appleButton,
                  pressed && styles.pressed,
                  isPending && styles.disabled,
                ]}
              >
                {isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="logo-apple" size={22} color="#FFFFFF" />
                    <Text style={[styles.socialLabel, styles.appleLabel]}>
                      {copy.apple}
                    </Text>
                  </>
                )}
              </Pressable>
            ) : null}

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>{copy.or}</Text>
              <View style={styles.orLine} />
            </View>

            <Pressable
              accessibilityRole="link"
              accessibilityLabel={copy.regularLogin}
              onPress={() => router.push(EMAIL_LOGIN_HREF)}
              hitSlop={8}
            >
              <Text style={styles.regularLogin}>{copy.regularLogin}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={copy.createAccount}
              onPress={() => router.push(SIGNUP_HREF)}
              hitSlop={8}
            >
              <Text style={styles.regularLogin}>{copy.createAccount}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
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
    marginTop: 24,
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
  spacer: {
    flex: 1,
  },
  actions: {
    gap: 14,
    paddingBottom: 8,
  },
  socialButton: {
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#0A2540",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  appleButton: {
    backgroundColor: APPLE_INK,
  },
  socialLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: APPLE_INK,
  },
  appleLabel: {
    color: "#FFFFFF",
  },
  orRow: {
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(29,29,31,0.22)",
  },
  orText: {
    fontSize: 13,
    fontWeight: "500",
    color: MUTED,
  },
  regularLogin: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: MUTED,
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.7,
  },
});

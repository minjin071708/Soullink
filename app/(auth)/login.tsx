import { useSocialAuthActions } from "@/hooks/auth/useSocialAuthActions";
import { useAppStore, type Language } from "@/store/use-language-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { router, type Href } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const APPLE_INK = "#1d1d1f";
const MUTED = "#6E6E73";
const LOGIN_BACKGROUND = require("@/assets/images/hellomascot.png");
const LOGIN_LOGO_WHITE = require("@/assets/images/logo_default.png");
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
    noAccount: string;
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
    noAccount: "Don't have an account?",
    createAccount: "Create account",
  },
  mn: {
    title: "Тавтай морил",
    subtitle: "Журнал руугаа үргэлжлүүлэн нэвтэрнэ үү",
    google: "Google-р үргэлжлүүлэх",
    apple: "Apple-р үргэлжлүүлэх",
    or: "эсвэл",
    regularLogin: "Имэйлээр нэвтрэх",
    noAccount: "Бүртгэл байхгүй юу?",
    createAccount: "Бүртгэл үүсгэх",
  },
  ko: {
    title: "다시 오신 걸 환영해요",
    subtitle: "저널을 이어가려면 로그인해 주세요",
    google: "Google로 계속하기",
    apple: "Apple로 계속하기",
    or: "또는",
    regularLogin: "일반 로그인",
    noAccount: "계정이 없으신가요?",
    createAccount: "계정 만들기",
  },
};

export default function LoginScreen() {
  const language = useAppStore((state) => state.language) ?? "mn";
  const copy = COPY[language];
  const { isPending, startSocialAuth } = useSocialAuthActions();

  return (
    <ImageBackground
      source={LOGIN_BACKGROUND}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.subtitle}>{copy.subtitle}</Text>
            <Image
              source={LOGIN_LOGO_WHITE}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="SoulLink"
            />
          </View>

          <View style={styles.spacer} />
        </View>
      </SafeAreaView>

      <View style={styles.sheetWrap}>
        <BlurView
          intensity={Platform.OS === "ios" ? 42 : 70}
          tint="light"
          style={styles.glassSheet}
        >
          <View style={styles.glassTint} />
          <SafeAreaView edges={["bottom"]} style={styles.sheetSafe}>
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
                accessibilityRole="button"
                accessibilityLabel={copy.regularLogin}
                disabled={isPending}
                onPress={() => router.push(EMAIL_LOGIN_HREF)}
                style={({ pressed }) => [
                  styles.emailButton,
                  pressed && styles.pressed,
                  isPending && styles.disabled,
                ]}
              >
                    <Text style={styles.socialLabel}>{copy.regularLogin}</Text>
              </Pressable>

       
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${copy.noAccount} ${copy.createAccount}`}
                onPress={() => router.push(SIGNUP_HREF)}
                hitSlop={8}
              >
                <Text style={styles.regularLogin}>
                  {copy.noAccount}{" "}
                  <Text style={styles.createAccountLink}>{" "}{copy.createAccount}</Text>
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </BlurView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#f2ece8",
  },
  backgroundImage: {
    width: "100%",
    height: "80%",
    resizeMode: "cover",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  header: {
    marginTop: 24,
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: APPLE_INK,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "400",
    letterSpacing: -0.5,
    color: APPLE_INK,
    textAlign: "center",
  },
  logo: {
    width: 260,
    height: 120,
  },
  spacer: {
    flex: 1,
  },
  sheetWrap: {
    overflow: "hidden",
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    ...Platform.select({
      ios: {
        shadowColor: "#2A2A4A",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  glassSheet: {
    overflow: "hidden",
    borderTopLeftRadius: 44,
    borderTopRightRadius: 44,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.72)",
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 252, 248, 0.42)",
  },
  sheetSafe: {
    backgroundColor: "transparent",
  },
  actions: {
    gap: 14,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 12,
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
  emailButton: {
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.53)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.53)",
 
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
    backgroundColor: "rgba(29,29,31,0.18)",
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
    paddingVertical: 20,
  },
  createAccountLink: {
    fontWeight: "600",
    color: APPLE_INK,
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

import { useSocialAuthActions } from "@/hooks/auth/useSocialAuthActions";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { router, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
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
const SIGNUP_BACKGROUND = require("@/assets/images/signupbg.png");
const SIGNUP_LOGO = require("@/assets/images/logo_default.png");
const LOGIN_HREF = "/(auth)/login" as Href;
const EMAIL_SIGNUP_HREF = "/(auth)/email-signup" as Href;

export default function SignupScreen() {
  const { t } = useTranslation();
  const { isPending, startSocialAuth } = useSocialAuthActions();

  return (
    <ImageBackground
      source={SIGNUP_BACKGROUND}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("auth.signup.title")}</Text>
            <Image
              source={SIGNUP_LOGO}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="SoulLink"
            />
            <Text style={styles.subtitle}>{t("auth.signup.subtitle")}</Text>
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
              accessibilityLabel={t("auth.signup.google")}
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
                  <Text style={styles.socialLabel}>{t("auth.signup.google")}</Text>
                </>
              )}
            </Pressable>

            {Platform.OS === "ios" ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("auth.signup.apple")}
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
                      {t("auth.signup.apple")}
                    </Text>
                  </>
                )}
              </Pressable>
            ) : null}

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>{t("auth.signup.or")}</Text>
              <View style={styles.orLine} />
            </View>

            <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("auth.emailSignIn")}
            onPress={() => router.push(EMAIL_SIGNUP_HREF)}
            style={styles.emailSignInLink}
            >
              <Ionicons name="mail" size={20} color={APPLE_INK} />
              <Text style={styles.emailSignInLinkText}>{t("auth.emailSignIn")}</Text>

            </Pressable>

            <Pressable
              accessibilityRole="link"
              accessibilityLabel={t("auth.signup.signIn")}
              onPress={() => router.push(LOGIN_HREF)}
              hitSlop={8}
            >
            
              <Text style={styles.signInLink}>{t("auth.signup.signIn")}</Text>
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
    height: "100%",
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
    gap: 10,
  },
  title: {
    fontSize: 26,
    lineHeight: 36,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: APPLE_INK,
    textAlign: "center",
  },
  logo: {
    width: 200,
    height: 60,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: APPLE_INK,
    textAlign: "center",
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
  emailSignInLink: {
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
  emailSignInLinkText: {
    fontSize: 16,
    fontWeight: "600",
    color: APPLE_INK,
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
  signInLink: {
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

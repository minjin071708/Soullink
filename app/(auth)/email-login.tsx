
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from '@/components/ui/vstack';
import { useLogin } from "@/hooks/auth/useLogin";
import { useAppStore, type Language } from "@/store/use-language-store";
import type { LoginResponseType } from "@/types/authType";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { AxiosError } from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const APPLE_INK = "#1d1d1f";
const MUTED = "#6E6E73";
const SCREEN_GRADIENT = ["#fffefa", "#fff6f5"] as const;
const LOGO_DEFAULT = require("@/assets/images/logo_default.png");
const SIGNUP_HREF = "/(auth)/signup" as const;

const COPY: Record<
  Language,
  {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    submit: string;
    findPassword: string;
    or: string;
    noAccount: string;
    signUp: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
  }
> = {
  en: {
    title: "Email login",
    subtitle: "Enter your email and password",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    findPassword: "Forgot password?",
    or: "or",
    noAccount: "Don't have an account?",
    signUp: "Sign up",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "••••••••",
  },
  mn: {
    title: "Имэйлээр нэвтрэх",
    subtitle: "Имэйл болон нууц үгээ оруулна уу",
    email: "Имэйл",
    password: "Нууц үг",
    submit: "Нэвтрэх",
    findPassword: "Нууц үг мартсан уу?",
    or: "эсвэл",
    noAccount: "Бүртгэлгүй юу?",
    signUp: "Бүртгүүлэх",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "••••••••",
  },
  ko: {
    title: "일반 로그인",
    subtitle: "이메일과 비밀번호를 입력해 주세요",
    email: "이메일",
    password: "비밀번호",
    submit: "로그인",
    findPassword: "비밀번호 변경",
    or: "또는",
    noAccount: "계정 없으신가요?",
    signUp: "회원가입",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "••••••••",
  },
};

export default function EmailLoginScreen() {
  const router = useRouter();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const language = useAppStore((state) => state.language) ?? "mn";
  const copy = COPY[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending } = useLogin();

  const handleSubmit = () => {
    login(
      {
        memberId: email,
        password,
      },
      {
        onSuccess: (response) => {
       
          router.replace("/(tabs)");
        },

        onError: (error) => {
          const axiosError = error as AxiosError<LoginResponseType>;

          const message =
            axiosError.response?.data?.message ??
            (error instanceof Error
              ? error.message
              : "로그인 중 오류가 발생했습니다.");

          toast.show({
            placement: "top",
            duration: 3000,
            render: ({ id }) => (
              <Toast
                nativeID={`login-error-${id}`}
                action="error"
                variant="solid"
                className="px-14 py-6 gap-6 shadow-soft-1 flex-row bg-white"
              >
                <MaterialIcons name="error-outline" size={32} color="red" />

                <VStack space="xs">
                  <ToastTitle size="md">로그인 실패</ToastTitle>
                  <ToastDescription size="md">{message}</ToastDescription>
                </VStack>
              </Toast>
            ),
          });
        },
      }
    );
  };
  


  return (
    <LinearGradient
      colors={[...SCREEN_GRADIENT]}
      locations={[0, 1]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 8 : 0}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 16) + 20 },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back"
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="chevron-back" size={28} color={APPLE_INK} />
              </Pressable>
              <View style={{ flex: 1, justifyContent: "space-between" }}>
              <View>
              <Image
                source={LOGO_DEFAULT}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="SoulLink"
              />
</View>

<View>
              <View style={styles.form}>

              <View style={styles.header}>
                <Text style={styles.title}>{copy.title}</Text>
                <Text style={styles.subtitle}>{copy.subtitle}</Text>
              </View>

                <Text style={styles.label}>{copy.email}</Text>
                <View>
               
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder={copy.emailPlaceholder}
                    placeholderTextColor="#A1A1A6"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.input}
                  />
                </View>

                <Text style={[styles.label, styles.labelSpaced]}>
                  {copy.password}
                </Text>
                <View style={styles.passwordBlock}>
                  <View style={styles.passwordRow}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder={copy.passwordPlaceholder}
                      placeholderTextColor="#A1A1A6"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={[styles.input, styles.passwordInput]}
                    />
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setShowPassword((prev) => !prev)}
                      style={styles.eyeButton}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={MUTED}
                      />
                    </Pressable>
                  </View>

                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={copy.findPassword}
                    hitSlop={10}
                    onPress={() => {
                      toast.show({
                        placement: "top",
                        duration: 2500,
                        render: ({ id }) => (
                          <Toast
                            nativeID={`find-password-${id}`}
                            action="error"
                            variant="solid"
                            className="px-14 py-6 shadow-soft-1 flex-row bg-white"
                          >
                            <VStack space="xs">
                              <ToastTitle size="md">Coming soon</ToastTitle>
                              <ToastDescription size="md">
                                {copy.findPassword}
                              </ToastDescription>
                            </VStack>
                          </Toast>
                        ),
                      });
                    }}
                    style={styles.findPassword}
                  >
                    <Text style={styles.findPasswordText}>
                      {copy.findPassword}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.spacer} />

              <Pressable
                accessibilityRole="button"
                onPress={handleSubmit}
                disabled={isPending}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.pressed,
                  isPending && styles.submitDisabled,
                ]}
              >
                <Text style={styles.submitLabel}>
                  {isPending ? "..." : copy.submit}
                </Text>
              </Pressable>

              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>{copy.or}</Text>
                <View style={styles.orLine} />
              </View>

              <View style={styles.signUpRow}>
                <Text style={styles.noAccountText}>{copy.noAccount}</Text>
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={copy.signUp}
                  onPress={() => router.push(SIGNUP_HREF)}
                  hitSlop={8}
                >
                  <Text style={styles.signUpLink}>{copy.signUp}</Text>
                </Pressable>
              </View>
            </View>
            </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    position: "relative",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,

  },
  header: {
    marginTop: 18,
    marginBottom: 28,
  },
  logo: {
    width: 260,
    height: 150,
    alignSelf: "center",
    marginTop: 10,
    zIndex: 1,
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
    gap: 0,
    position: "relative",
    zIndex: 1,
  },
  label: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
    color: APPLE_INK,
  },
  labelSpaced: {
    marginTop: 18,
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: APPLE_INK,
    borderWidth: 1,
    borderColor: "rgba(29,29,31,0.08)",
  },

  passwordRow: {
    position: "relative",
    justifyContent: "center",
  },
  passwordBlock: {
    gap: 6,
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    height: 54,
    justifyContent: "center",
  },
  spacer: {
    flex: 1,
    minHeight: 72,
  },
  submitButton: {
    minHeight: 56,
    width: "100%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: APPLE_INK,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  orRow: {
    marginTop: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(29,29,31,0.18)",
  },
  orText: {
    fontSize: 12,
    fontWeight: "500",
    color: MUTED,
  },
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  noAccountText: {
    fontSize: 13,
    fontWeight: "500",
    color: MUTED,
  },
  signUpLink: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7772F8",
  },
  findPassword: {
    alignSelf: "flex-end",
  },
  findPasswordText: {
    fontSize: 13,
    fontWeight: "600",
    color: APPLE_INK,
    opacity: 0.8,

  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});

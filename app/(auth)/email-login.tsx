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
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const APPLE_INK = "#1d1d1f";
const MUTED = "#6E6E73";
const SCREEN_GRADIENT = ["#f3edff", "#fff6f5"] as const;

const COPY: Record<
  Language,
  {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    submit: string;
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
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "••••••••",
  },
  mn: {
    title: "Имэйлээр нэвтрэх",
    subtitle: "Имэйл болон нууц үгээ оруулна уу",
    email: "Имэйл",
    password: "Нууц үг",
    submit: "Нэвтрэх",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "••••••••",
  },
  ko: {
    title: "일반 로그인",
    subtitle: "이메일과 비밀번호를 입력해 주세요",
    email: "이메일",
    password: "비밀번호",
    submit: "로그인",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "••••••••",
  },
};

export default function EmailLoginScreen() {
  const router = useRouter();
  const toast = useToast();
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
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
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
                <Ionicons name="chevron-back" size={24} color={APPLE_INK} />
              </Pressable>

              <View style={styles.header}>
                <Text style={styles.title}>{copy.title}</Text>
                <Text style={styles.subtitle}>{copy.subtitle}</Text>
              </View>

              <View style={styles.form}>
                <Text style={styles.label}>{copy.email}</Text>
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

                <Text style={[styles.label, styles.labelSpaced]}>
                  {copy.password}
                </Text>
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
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  header: {
    marginTop: 18,
    marginBottom: 28,
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
    minHeight: 24,
  },
  submitButton: {
    minHeight: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: APPLE_INK,
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});

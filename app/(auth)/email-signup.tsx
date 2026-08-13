import { useEmailSignup, useSendEmailVerificationCode, useVerifyEmailCode } from "@/hooks/auth/useEmailSignup";
import { emailSignupRequestSchema } from "@/schemas/authSchema";
import { EmailSignupRequest } from "@/types/authType";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const TEXT = "#111111";
const MUTED = "#8E8E93";
const BORDER = "#E5E5EA";
const ACCENT = "#111111";
const BG = "#FFFFFF";
const LOGIN_HREF = "/(auth)/login" as Href;

type FormInputProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  rightIcon?: "eye" | "eye-off";
  onRightIconPress?: () => void;
  highlight?: boolean;
  requiredTag?: string;
  keyboardType?: "default" | "email-address";
};

function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  rightIcon,
  onRightIconPress,
  highlight = false,
  requiredTag,
  keyboardType = "default",
}: FormInputProps) {
  return (
    <View style={styles.inputGroup}>
      <View style={styles.inputHeader}>
        <Text style={styles.inputLabel}>{label}</Text>
        {requiredTag ? (
          <Text style={styles.requiredTag}>{requiredTag}</Text>
        ) : null}
      </View>
      <View style={[styles.inputRow, highlight && styles.inputRowHighlighted]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={MUTED}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          keyboardType={keyboardType}
          style={styles.input}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} hitSlop={10}>
            <Ionicons name={rightIcon} size={18} color="#6E6E73" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function EmailSignupScreen() {
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmailSignupRequest>({
    resolver: zodResolver(emailSignupRequestSchema),
    mode: "onChange",
    defaultValues: {
      memberId: "",
      email: "",
      emailVerificationToken: "",
      password: "",
      passwordConfirm: "",
      nickname: "",
      serviceTermsAgree: false,
      privacyAgree: false,
      marketingAgree: false,
    },
  });

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationCodeSent, setIsVerificationCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationTimeLeft, setVerificationTimeLeft] = useState(0);
  const [resendTimeLeft, setResendTimeLeft] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [agreeService, setAgreeService] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [maskedEmail, setMaskedEmail] = useState("");

  const agreeAll = agreeService && agreePrivacy && agreeMarketing;

// Send амжилттай
// → code input нээгдэнэ
// → 5 минутын timer эхэлнэ
// → resend 60 секунд disabled
// or send error render error message USING TOAST

// Verify амжилттай
// → emailVerificationToken хадгална
// → email input lock хийнэ
// → 인증 완료 харуулна

// Signup
// → token-ийг бусад form data-тай хамт явуулна

//   hooks 
//  1. Send email verification code mutation
  const {
    sendEmailVerificationCode,
    isPending,
  } = useSendEmailVerificationCode();

  //  2. Verify email code mutation
  const {
    verifyEmailCode,
    isPending: isVerifyPending,
  } = useVerifyEmailCode();

//  3. Signup mutation
  const {
    signup,
    isPending: isSignupPending,
  } = useEmailSignup();


  useEffect(() => {
    if (!isVerificationCodeSent || verificationTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setVerificationTimeLeft((current) => Math.max(0, current - 1));
      setResendTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isVerificationCodeSent, verificationTimeLeft]);

  const formattedVerificationTime = `${Math.floor(
    verificationTimeLeft / 60,
  )}:${String(verificationTimeLeft % 60).padStart(2, "0")}`;

  const canSubmit = useMemo(
    () =>
      userId.trim().length >= 4 &&
      password.length >= 8 &&
      password === passwordConfirm &&
      nickname.trim().length > 0 &&
      email.trim().length > 0 &&
      isEmailVerified &&
      agreeService &&
      agreePrivacy,
    [
      agreePrivacy,
      agreeService,
      email,
      isEmailVerified,
      nickname,
      password,
      passwordConfirm,
      userId,
    ],
  );

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setVerificationCode("");
    setIsVerificationCodeSent(false);
    setIsEmailVerified(false);
    setVerificationTimeLeft(0);
    setResendTimeLeft(0);
  };

  const handleSendVerificationCode = () => {
    if (!email.trim() || resendTimeLeft > 0 || isPending) return;
  
    sendEmailVerificationCode(
      { email: email.trim() },
      {
        onSuccess: (response) => {
          const {
            verificationId,
            maskedEmail,
            expiresInSeconds,
            resendAvailableInSeconds,
          } = response.data;
  
          setVerificationId(verificationId);
          setMaskedEmail(maskedEmail);
          setVerificationCode("");
          setIsVerificationCodeSent(true);
          setIsEmailVerified(false);
          setVerificationTimeLeft(expiresInSeconds);
          setResendTimeLeft(resendAvailableInSeconds);
        },
        onError: (err) => {
          console.error("인증번호 발송 실패:", err);
        },
      }
    );
  };

  const handleVerifyEmail = () => {
    if (verificationCode.length !== 6 || verificationTimeLeft <= 0) return;

    // TODO: 인증번호 검증 API 성공 후 emailVerificationToken을 저장합니다.
    setIsEmailVerified(true);
    setIsVerificationCodeSent(false);
  };

  const toggleAll = () => {
    const next = !agreeAll;
    setAgreeService(next);
    setAgreePrivacy(next);
    setAgreeMarketing(next);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={21} color={TEXT} />
        </Pressable>

        <Text style={styles.title}>{t("auth.emailSignup.title")}</Text>
        <Text style={styles.subtitle}>{t("auth.emailSignup.subtitle")}</Text>

        <View style={styles.form}>
          <FormInput
            label={t("auth.emailSignup.id")}
            placeholder={t("auth.emailSignup.idPlaceholder")}
            value={userId}
            onChangeText={setUserId}
          />
          <FormInput
            label={t("auth.emailSignup.password")}
            placeholder={t("auth.emailSignup.passwordPlaceholder")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPassword((prev) => !prev)}
          />
          <FormInput
            label={t("auth.emailSignup.passwordConfirm")}
            placeholder={t("auth.emailSignup.passwordConfirmPlaceholder")}
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry={!showPasswordConfirm}
            rightIcon={showPasswordConfirm ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPasswordConfirm((prev) => !prev)}
          />
          <FormInput
            label={t("auth.emailSignup.nickname")}
            placeholder={t("auth.emailSignup.nicknamePlaceholder")}
            value={nickname}
            onChangeText={setNickname}
          />
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>{t("auth.emailSignup.email")}</Text>
              <Text style={styles.requiredTag}>{t("auth.emailSignup.required")}</Text>
            </View>
            <View style={styles.emailRow}>
              <View
                style={[
                  styles.inputRow,
                  styles.emailInputRow,
                  styles.inputRowHighlighted,
                  isEmailVerified && styles.inputRowVerified,
                ]}
              >
                <TextInput
                  value={email}
                  onChangeText={handleEmailChange}
                  placeholder="example@email.com"
                  placeholderTextColor={MUTED}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isEmailVerified}
                  style={styles.input}
                />
                {isEmailVerified ? (
                  <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                ) : null}
              </View>
              {!isEmailVerified ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={!email.trim() || resendTimeLeft > 0 || isPending}
                  onPress={handleSendVerificationCode}
                  style={({ pressed }) => [
                    styles.verificationButton,
                    (!email.trim() || resendTimeLeft > 0 || isPending) &&
                      styles.verificationButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.verificationButtonText}>
                    {isVerificationCodeSent
                      ? resendTimeLeft > 0
                        ? t("auth.emailSignup.resendVerificationCodeCountdown", {
                            seconds: resendTimeLeft,
                          })
                        : t("auth.emailSignup.resendVerificationCode")
                      : t("auth.emailSignup.sendVerificationCode")}
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {isVerificationCodeSent && !isEmailVerified ? (
              <View style={styles.verificationCodeSection}>
                <Text style={styles.verificationCodeLabel}>
                  {t("auth.emailSignup.verificationCode")}
                </Text>
                <View style={styles.verificationCodeRow}>
                  <View
                    style={[styles.inputRow, styles.verificationCodeInputRow]}
                  >
                    <TextInput
                      value={verificationCode}
                      onChangeText={(value) =>
                        setVerificationCode(
                          value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder={t("auth.emailSignup.verificationCodePlaceholder")}
                      placeholderTextColor={MUTED}
                      keyboardType="number-pad"
                      maxLength={6}
                      style={styles.input}
                    />
                    <Text
                      style={[
                        styles.timerText,
                        verificationTimeLeft === 0 && styles.timerExpired,
                      ]}
                    >
                      {formattedVerificationTime}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    disabled={
                      verificationCode.length !== 6 || verificationTimeLeft <= 0
                    }
                    onPress={handleVerifyEmail}
                    style={({ pressed }) => [
                      styles.verifyButton,
                      (verificationCode.length !== 6 ||
                        verificationTimeLeft <= 0) &&
                        styles.verificationButtonDisabled,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.verifyButtonText}>
                      {t("auth.emailSignup.verify")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {isEmailVerified ? (
              <View style={styles.verificationSuccessRow}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <Text style={styles.verificationSuccessText}>
                  {t("auth.emailSignup.verificationComplete")}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text style={styles.agreementTitle}>
          {t("auth.emailSignup.agreementTitle")}
        </Text>
        <View style={styles.agreementCard}>
          <Pressable style={styles.agreementRow} onPress={toggleAll}>
            <Ionicons
              name={agreeAll ? "checkmark-circle" : "ellipse-outline"}
              size={22}
              color={agreeAll ? ACCENT : "#C7C7CC"}
            />
            <Text style={styles.agreementText}>
              {t("auth.emailSignup.allAgree")}
            </Text>
          </Pressable>

          {[
            {
              key: "service",
              label: t("auth.emailSignup.serviceAgree"),
              value: agreeService,
              onPress: setAgreeService,
            },
            {
              key: "privacy",
              label: t("auth.emailSignup.privacyAgree"),
              value: agreePrivacy,
              onPress: setAgreePrivacy,
            },
            {
              key: "marketing",
              label: t("auth.emailSignup.marketingAgree"),
              value: agreeMarketing,
              onPress: setAgreeMarketing,
            },
          ].map((item) => (
            <View key={item.key} style={styles.agreementRow}>
              <Pressable
                style={styles.agreementLeft}
                onPress={() => item.onPress(!item.value)}
              >
                <Ionicons
                  name={item.value ? "checkmark-circle" : "ellipse-outline"}
                  size={21}
                  color={item.value ? ACCENT : "#C7C7CC"}
                />
                <Text style={styles.agreementText}>{item.label}</Text>
              </Pressable>
              <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled,
            pressed && canSubmit && styles.submitButtonPressed,
          ]}
        >
          <Text style={styles.submitText}>{t("auth.emailSignup.submit")}</Text>
        </Pressable>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomHint}>{t("auth.emailSignup.hasAccount")}</Text>
          <Pressable onPress={() => router.push(LOGIN_HREF)}>
            <Text style={styles.loginLink}>{t("auth.emailSignup.login")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 40,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  pressed: {
    opacity: 0.6,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: TEXT,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 7,
    marginBottom: 30,
    paddingHorizontal: 20,
    fontSize: 14,
    lineHeight: 20,
    color: "#6E6E73",
    textAlign: "center",
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  inputLabel: {
    fontSize: 13,
    color: TEXT,
    fontWeight: "600",
  },
  requiredTag: {
    fontSize: 11,
    color: "#6E6E73",
    fontWeight: "600",
  },
  inputRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 13,
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputRowHighlighted: {
    borderColor: "#D1D1D6",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
    paddingVertical: 0,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emailInputRow: {
    flex: 1,
  },
  inputRowVerified: {
    borderColor: "#34C759",
    backgroundColor: "#F2FBF4",
  },
  verificationButton: {
    minWidth: 102,
    height: 52,
    borderRadius: 13,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  verificationButtonDisabled: {
    backgroundColor: "#D1D1D6",
  },
  verificationButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  verificationCodeSection: {
    marginTop: 4,
    gap: 8,
  },
  verificationCodeLabel: {
    fontSize: 13,
    color: TEXT,
    fontWeight: "600",
  },
  verificationCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verificationCodeInputRow: {
    flex: 1,
  },
  timerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF3B30",
  },
  timerExpired: {
    color: MUTED,
  },
  verifyButton: {
    minWidth: 68,
    height: 52,
    borderRadius: 13,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  verificationSuccessRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  verificationSuccessText: {
    color: "#248A3D",
    fontSize: 12,
    fontWeight: "500",
  },
  agreementTitle: {
    marginTop: 30,
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "600",
    color: TEXT,
  },
  agreementCard: {
    borderRadius: 14,
    backgroundColor: "#F7F7F8",
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  agreementRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  agreementLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    flex: 1,
  },
  agreementText: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
    fontWeight: "400",
  },
  submitButton: {
    marginTop: 24,
    height: 54,
    borderRadius: 27,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#D1D1D6",
  },
  submitButtonPressed: {
    opacity: 0.78,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bottomRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  bottomHint: {
    fontSize: 13,
    color: MUTED,
  },
  loginLink: {
    fontSize: 13,
    color: TEXT,
    fontWeight: "600",
  },
});
import type { ProfileImageUpload } from "@/api/memberApi";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { memberMeQueryKey } from "@/hooks/useMemberMe";
import { useUploadMemberProfileImage } from "@/hooks/useMemberProfileImage";
import { useUpdateMemberMe } from "@/hooks/useUpdateMemberMe";
import { useAuthStore } from "@/store/authStore";
import {
  clearSocialProfileSetupRequired,
  getSuggestedSocialProfileNickname,
  isSocialProfileSetupRequired,
} from "@/store/socialSignupStore";
import { useAppStore } from "@/store/use-language-store";
import { mapSocialAuthErrorMessage } from "@/utils/socialAuthErrors";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
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
const DEFAULT_AVATAR = require("@/assets/images/defaultAvatar.png");
const HOME_HREF = "/(tabs)" as Href;
const LOGIN_HREF = "/(auth)/login" as Href;
const MAX_NICKNAME_LENGTH = 30;
const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function getNicknameErrorKey(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "auth.socialProfileSetup.nicknameRequired";
  }
  if (trimmed.length > MAX_NICKNAME_LENGTH) {
    return "auth.socialProfileSetup.nicknameLength";
  }
  return null;
}

function toProfileImageUpload(
  asset: ImagePicker.ImagePickerAsset
): ProfileImageUpload | "invalidType" | "tooLarge" {
  const mimeType = (asset.mimeType ?? "image/jpeg").toLowerCase();
  if (!ALLOWED_PROFILE_IMAGE_TYPES.has(mimeType)) {
    return "invalidType";
  }
  if (
    typeof asset.fileSize === "number" &&
    asset.fileSize > MAX_PROFILE_IMAGE_BYTES
  ) {
    return "tooLarge";
  }

  const extension = mimeType.includes("png")
    ? "png"
    : mimeType.includes("webp")
      ? "webp"
      : "jpg";

  return {
    uri: asset.uri,
    name: asset.fileName ?? `profile-${Date.now()}.${extension}`,
    type: mimeType === "image/jpg" ? "image/jpeg" : mimeType,
  };
}

export default function SocialProfileSetupScreen() {
  const { t } = useTranslation();
  const toast = useToast();
  const queryClient = useQueryClient();
  const language = useAppStore((state) => state.language) ?? "MN";
  const member = useAuthStore((state) => state.member);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateMember = useUpdateMemberMe();
  const uploadProfileImage = useUploadMemberProfileImage();

  const [nickname, setNickname] = useState(
    () => getSuggestedSocialProfileNickname() ?? member?.nickname ?? ""
  );
  const [selectedImage, setSelectedImage] = useState<ProfileImageUpload | null>(
    null
  );
  const [showValidation, setShowValidation] = useState(false);
  const nicknameSavedRef = useRef(false);
  const submittingRef = useRef(false);

  const isBusy = updateMember.isPending || uploadProfileImage.isPending;
  const nicknameErrorKey = getNicknameErrorKey(nickname);
  const canSubmit = nicknameErrorKey == null && !isBusy;

  useEffect(() => {
    if (!isSocialProfileSetupRequired()) {
      router.replace(isAuthenticated ? HOME_HREF : LOGIN_HREF);
    }
  }, [isAuthenticated]);

  const previewSource = useMemo(
    () => (selectedImage ? { uri: selectedImage.uri } : DEFAULT_AVATAR),
    [selectedImage]
  );

  const showError = (title: string, message: string) => {
    toast.show({
      placement: "top",
      duration: 3000,
      render: ({ id }) => (
        <Toast
          nativeID={`social-profile-setup-error-${id}`}
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

  const goHome = async () => {
    clearSocialProfileSetupRequired();
    await queryClient.invalidateQueries({ queryKey: memberMeQueryKey });
    router.replace(HOME_HREF);
  };

  const uploadImage = async (image: ProfileImageUpload): Promise<boolean> => {
    try {
      await uploadProfileImage.mutateAsync(image);
      return true;
    } catch {
      Alert.alert(
        t("auth.socialProfileSetup.imageFailedTitle"),
        t("auth.socialProfileSetup.imageFailedMessage"),
        [
          {
            text: t("auth.socialProfileSetup.retryPhoto"),
            onPress: () => {
              void uploadImage(image).then((ok) => {
                if (ok) {
                  void goHome();
                }
              });
            },
          },
          {
            text: t("auth.socialProfileSetup.continueWithoutPhoto"),
            onPress: () => {
              void goHome();
            },
          },
        ]
      );
      return false;
    }
  };

  const pickImage = async () => {
    if (isBusy) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const mapped = toProfileImageUpload(result.assets[0]);
    if (mapped === "invalidType") {
      showError(t("profile.photo.title"), t("profile.photo.invalidType"));
      return;
    }
    if (mapped === "tooLarge") {
      showError(t("profile.photo.title"), t("profile.photo.tooLarge"));
      return;
    }

    setSelectedImage(mapped);
  };

  const completeSetup = async (imageToUpload: ProfileImageUpload | null) => {
    setShowValidation(true);
    if (getNicknameErrorKey(nickname) != null || submittingRef.current) {
      return;
    }

    submittingRef.current = true;

    try {
      if (!nicknameSavedRef.current) {
        await updateMember.mutateAsync({ nickname: nickname.trim() });
        nicknameSavedRef.current = true;
      }

      if (imageToUpload) {
        const imageOk = await uploadImage(imageToUpload);
        if (!imageOk) {
          return;
        }
      }

      await goHome();
    } catch (error) {
      showError(
        t("auth.socialProfileSetup.errorTitle"),
        mapSocialAuthErrorMessage(error, language)
      );
    } finally {
      submittingRef.current = false;
    }
  };

  const handleContinue = () => {
    void completeSetup(selectedImage);
  };

  const handleSkipPhoto = () => {
    setSelectedImage(null);
    void completeSetup(null);
  };

  return (
    <LinearGradient
      colors={[...SCREEN_GRADIENT]}
      locations={[0, 1]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={8}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>
              {t("auth.socialProfileSetup.title")}
            </Text>
            <Text style={styles.subtitle}>
              {t("auth.socialProfileSetup.subtitle")}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("auth.socialProfileSetup.addPhoto")}
              disabled={isBusy}
              onPress={() => {
                void pickImage();
              }}
              style={styles.avatarPressable}
            >
              <Image
                source={previewSource}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            </Pressable>
            <Text style={styles.photoHint}>
              {t("auth.socialProfileSetup.photoHint")}
            </Text>

            <Text style={styles.label}>
              {t("auth.socialProfileSetup.nickname")}
            </Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              onBlur={() => setShowValidation(true)}
              placeholder={t("auth.socialProfileSetup.nicknamePlaceholder")}
              placeholderTextColor="rgba(110,110,115,0.7)"
              maxLength={MAX_NICKNAME_LENGTH}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isBusy}
              style={styles.input}
            />
            {showValidation && nicknameErrorKey ? (
              <Text style={styles.validation}>{t(nicknameErrorKey)}</Text>
            ) : null}

            <View style={styles.spacer} />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("auth.socialProfileSetup.continue")}
              disabled={!canSubmit}
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.submitButton,
                !canSubmit && styles.submitDisabled,
                pressed && canSubmit && styles.pressed,
              ]}
            >
              {isBusy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitLabel}>
                  {t("auth.socialProfileSetup.continue")}
                </Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("auth.socialProfileSetup.skipPhoto")}
              disabled={isBusy}
              onPress={handleSkipPhoto}
              hitSlop={8}
              style={styles.skipButton}
            >
              <Text style={styles.skipLabel}>
                {t("auth.socialProfileSetup.skipPhoto")}
              </Text>
            </Pressable>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
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
  avatarPressable: {
    alignSelf: "center",
    marginTop: 36,
    marginBottom: 10,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#E8E8ED",
  },
  cameraBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: APPLE_INK,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  photoHint: {
    textAlign: "center",
    fontSize: 13,
    color: MUTED,
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: APPLE_INK,
    marginBottom: 8,
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
  validation: {
    marginTop: 8,
    fontSize: 13,
    color: "#E0567A",
  },
  spacer: {
    flexGrow: 1,
    minHeight: 24,
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
  skipButton: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 8,
  },
  skipLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: MUTED,
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});

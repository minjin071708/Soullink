import { useLogout } from "@/hooks/auth/useLogout";
import {
  useDeleteMemberProfileImage,
  useUploadMemberProfileImage,
} from "@/hooks/useMemberProfileImage";
import { memberMeQueryKey } from "@/hooks/useMemberMe";
import { useUpdateMemberMe } from "@/hooks/useUpdateMemberMe";
import i18n from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { useAppStore, type Language } from "@/store/use-language-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_BG = "#F7F8FC";
const TITLE_COLOR = "#27265E";
const MUTED = "#8B8FA8";
const PRIMARY = "#8A6BE8";
const ICON_BG = "#F0EAFF";
const LOGOUT = "#E0567A";
const LOGOUT_BG = "#FDE8EE";
const DEFAULT_AVATAR = require("@/assets/mascotImages/happy.png");
const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const LANGUAGE_OPTIONS: Language[] = ["ko", "mn", "en"];

type MenuIcon = keyof typeof Ionicons.glyphMap;

type MenuItem = {
  key: string;
  labelKey:
    | "profile.editProfile"
    | "profile.settings"
    | "profile.notifications"
    | "profile.language"
    | "profile.biometricLogin";
  icon: MenuIcon;
  onPress?: () => void;
};

function normalizeLanguageCode(value: string | null | undefined): Language {
  const code = (value ?? "").trim().toLowerCase();
  if (code === "en" || code === "mn" || code === "ko") {
    return code;
  }
  return "mn";
}

export default function Profile() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const member = useAuthStore((state) => state.member);
  const setMember = useAuthStore((state) => state.setMember);
  const storedLanguage = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const { mutate: logout, isPending } = useLogout();
  const updateMember = useUpdateMemberMe();
  const uploadProfileImage = useUploadMemberProfileImage();
  const deleteProfileImage = useDeleteMemberProfileImage();
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);

  const isPhotoBusy =
    uploadProfileImage.isPending || deleteProfileImage.isPending;

  const hasCustomPhoto = Boolean(member?.profileImageUrl);
  const avatarSource = hasCustomPhoto
    ? { uri: member!.profileImageUrl! }
    : DEFAULT_AVATAR;

  const selectedLanguage = useMemo(
    () =>
      normalizeLanguageCode(
        member?.preferredLanguageCode || storedLanguage || i18n.language
      ),
    [member?.preferredLanguageCode, storedLanguage]
  );

  const displayName =
    member?.nickname?.trim() ||
    member?.memberId?.trim() ||
    t("home.friend");

  const showPhotoError = (messageKey = "profile.photo.uploadFailed") => {
    Alert.alert(t("profile.photo.title"), t(messageKey));
  };

  const pickAndUploadPhoto = async () => {
    if (isPhotoBusy) {
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

    const asset = result.assets[0];
    const mimeType = (asset.mimeType ?? "image/jpeg").toLowerCase();
    const extension = mimeType.includes("png")
      ? "png"
      : mimeType.includes("webp")
        ? "webp"
        : "jpg";

    if (!ALLOWED_PROFILE_IMAGE_TYPES.has(mimeType)) {
      showPhotoError("profile.photo.invalidType");
      return;
    }

    if (
      typeof asset.fileSize === "number" &&
      asset.fileSize > MAX_PROFILE_IMAGE_BYTES
    ) {
      showPhotoError("profile.photo.tooLarge");
      return;
    }

    uploadProfileImage.mutate(
      {
        uri: asset.uri,
        name: asset.fileName ?? `profile-${Date.now()}.${extension}`,
        type: mimeType === "image/jpg" ? "image/jpeg" : mimeType,
      },
      { onError: () => showPhotoError() }
    );
  };

  const removePhoto = () => {
    if (isPhotoBusy || !hasCustomPhoto) {
      return;
    }

    deleteProfileImage.mutate(undefined, { onError: () => showPhotoError() });
  };

  const handleAvatarPress = () => {
    if (isPhotoBusy) {
      return;
    }

    const buttons: {
      text: string;
      style?: "cancel" | "destructive" | "default";
      onPress?: () => void;
    }[] = [
      {
        text: t("profile.photo.change"),
        onPress: () => {
          void pickAndUploadPhoto();
        },
      },
    ];

    if (hasCustomPhoto) {
      buttons.push({
        text: t("profile.photo.remove"),
        style: "destructive",
        onPress: removePhoto,
      });
    }

    buttons.push({
      text: t("profile.photo.cancel"),
      style: "cancel",
    });

    Alert.alert(t("profile.photo.title"), undefined, buttons);
  };

  const handleSelectLanguage = (code: Language) => {
    if (updateMember.isPending) {
      return;
    }

    if (code === selectedLanguage) {
      setLanguagePickerOpen(false);
      return;
    }

    const nickname =
      member?.nickname?.trim() ||
      member?.memberId?.trim() ||
      displayName;

    updateMember.mutate(
      {
        nickname,
        preferredLanguageCode: code,
      },
      {
        onSuccess: async (updated) => {
          const patched = {
            ...updated,
            preferredLanguageCode: code,
          };
          queryClient.setQueryData(memberMeQueryKey, patched);
          setMember(patched);
          setLanguage(code);
          await i18n.changeLanguage(code);
          setLanguagePickerOpen(false);
        },
      }
    );
  };

  const menuItems: MenuItem[] = [
    {
      key: "edit",
      labelKey: "profile.editProfile",
      icon: "person-outline",
      onPress: () => router.push("/profile/edit"),
    },
    {
      key: "settings",
      labelKey: "profile.settings",
      icon: "settings-outline",
    },
    {
      key: "notifications",
      labelKey: "profile.notifications",
      icon: "notifications-outline",
    },
    {
      key: "language",
      labelKey: "profile.language",
      icon: "globe-outline",
      onPress: () => setLanguagePickerOpen(true),
    },
    {
      key: "biometric",
      labelKey: "profile.biometricLogin",
      icon: "finger-print-outline",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t("profile.title")}</Text>

        <LinearGradient
          colors={["#FFE6EF", "#F3E9FF", "#F7F8FC"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("profile.photo.title")}
              disabled={isPhotoBusy}
              onPress={handleAvatarPress}
              style={({ pressed }) => [
                styles.avatarPressable,
                pressed && styles.pressed,
                isPhotoBusy && styles.disabled,
              ]}
            >
              <View style={styles.avatarRing}>
                <Image
                  source={avatarSource}
                  style={styles.avatar}
                  contentFit="cover"
                />
                {isPhotoBusy ? (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator color="#FFFFFF" />
                  </View>
                ) : (
                  <View style={styles.cameraBadge}>
                    <Ionicons name="camera" size={12} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </Pressable>

            <View style={styles.profileText}>
              <Text style={styles.userName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.tagline}>{t("profile.tagline")}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/profile/edit")}
            accessibilityRole="button"
            accessibilityLabel={t("profile.edit")}
            style={({ pressed }) => [
              styles.editFab,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="pencil" size={16} color={LOGOUT} />
          </Pressable>
        </LinearGradient>

        <View style={styles.menuCard}>
          {menuItems.map((item) => (
            <View key={item.key}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t(item.labelKey)}
                onPress={item.onPress}
                style={({ pressed }) => [
                  styles.menuRow,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconBox}>
                    <Ionicons name={item.icon} size={20} color={PRIMARY} />
                  </View>
                  <View style={styles.menuTextWrap}>
                    <Text style={styles.menuLabel}>{t(item.labelKey)}</Text>
                    {item.key === "language" ? (
                      <Text style={styles.menuValue}>
                        {t(`profile.editPage.languages.${selectedLanguage}`)}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C5C8D6" />
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("profile.logout")}
          disabled={isPending}
          onPress={() => logout()}
          style={({ pressed }) => [
            styles.logoutCard,
            pressed && styles.pressed,
            isPending && styles.disabled,
          ]}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconBox, styles.logoutIconBox]}>
              <Ionicons name="exit-outline" size={20} color={LOGOUT} />
            </View>
            <Text style={styles.logoutLabel}>{t("profile.logout")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={LOGOUT} />
        </Pressable>
      </ScrollView>

      <Modal
        visible={languagePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!updateMember.isPending) {
            setLanguagePickerOpen(false);
          }
        }}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => {
            if (!updateMember.isPending) {
              setLanguagePickerOpen(false);
            }
          }}
        >
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>
              {t("profile.editPage.selectLanguage")}
            </Text>

            {LANGUAGE_OPTIONS.map((code) => {
              const selected = selectedLanguage === code;
              return (
                <Pressable
                  key={code}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  disabled={updateMember.isPending}
                  onPress={() => handleSelectLanguage(code)}
                  style={({ pressed }) => [
                    styles.optionRow,
                    selected && styles.optionRowSelected,
                    pressed && styles.pressed,
                    updateMember.isPending && styles.disabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {t(`profile.editPage.languages.${code}`)}
                  </Text>
                  {selected ? (
                    <Ionicons name="checkmark" size={20} color={PRIMARY} />
                  ) : null}
                </Pressable>
              );
            })}

            {updateMember.isPending ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator color={PRIMARY} />
              </View>
            ) : null}

            {updateMember.isError ? (
              <Text style={styles.modalError}>
                {t("profile.editPage.updateFailed")}
              </Text>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  title: {
    marginBottom: 18,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: TITLE_COLOR,
  },
  profileCard: {
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
    overflow: "hidden",
    minHeight: 120,
    justifyContent: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingRight: 36,
  },
  avatarPressable: {
    borderRadius: 36,
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: PRIMARY,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 68,
    height: 68,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(42, 42, 106, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  profileText: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    color: TITLE_COLOR,
  },
  tagline: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
  editFab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8A6BE8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 8,
    marginBottom: 14,
    shadowColor: "#27265E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  menuRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f2f2",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuTextWrap: {
    flex: 1,
    justifyContent: "center",
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: TITLE_COLOR,
  },
  menuValue: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 16,
    color: MUTED,
  },
  logoutCard: {
    minHeight: 64,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#27265E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  logoutIconBox: {
    backgroundColor: LOGOUT_BG,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: LOGOUT,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(23, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TITLE_COLOR,
    marginBottom: 8,
  },
  optionRow: {
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionRowSelected: {
    backgroundColor: "#F3EEFF",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "600",
    color: TITLE_COLOR,
  },
  optionTextSelected: {
    color: PRIMARY,
  },
  modalLoading: {
    paddingVertical: 8,
    alignItems: "center",
  },
  modalError: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 13,
    color: "#D35A5A",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});

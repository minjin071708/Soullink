import { useLogout } from "@/hooks/auth/useLogout";
import { memberMeQueryKey, useMemberMe } from "@/hooks/useMemberMe";
import {
  useDeleteMemberProfileImage,
  useUploadMemberProfileImage,
} from "@/hooks/useMemberProfileImage";
import { useUpdateMemberMe } from "@/hooks/useUpdateMemberMe";
import i18n from "@/i18n";
import {
  getBiometricCapability,
  promptBiometricUnlock,
} from "@/services/biometricService";
import { useAuthStore } from "@/store/authStore";
import {
  toI18nLanguage,
  useAppStore,
  type Language,
} from "@/store/use-language-store";
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_BG = "#F7F8FC";
const TITLE_COLOR = "#27265E";
const MUTED = "#8B8FA8";
const PRIMARY = "#8A6BE8";
const ICON_BG = "#EFE7FF";
const CARD_BORDER = "#EEEAF6";
const DIVIDER = "#F0EEF6";
const LOGOUT = "#E0567A";
const DEFAULT_AVATAR = require("@/assets/images/defaultAvatar.png");
const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const LANGUAGE_OPTIONS: Language[] = ["KO", "MN", "EN"];

type MenuIcon = keyof typeof Ionicons.glyphMap;

type MenuItem = {
  key: string;
  labelKey:
    | "profile.settings"
    | "profile.notifications"
    | "profile.language"
    | "profile.biometricLogin";
  icon: MenuIcon;
  iconColor: string;
  onPress?: () => void;
};

function normalizeLanguageCode(value: string | null | undefined): Language {
  const code = (value ?? "").trim().toUpperCase();
  if (code === "EN" || code === "MN" || code === "KO") {
    return code;
  }
  return "MN";
}

function formatJoinDate(value: string | undefined): string {
  if (!value) {
    return "";
  }

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (isoDate) {
    return `${isoDate[1]}.${isoDate[2]}.${isoDate[3]}`;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export default function Profile() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const storeMember = useAuthStore((state) => state.member);
  const setMember = useAuthStore((state) => state.setMember);
  const { data: memberMe } = useMemberMe();
  const member = memberMe ?? storeMember;
  const storedLanguage = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const biometricUnlockEnabled = useAppStore(
    (state) => state.biometricUnlockEnabled
  );
  const setBiometricUnlockEnabled = useAppStore(
    (state) => state.setBiometricUnlockEnabled
  );
  const { mutate: logout, isPending } = useLogout();
  const updateMember = useUpdateMemberMe();
  const uploadProfileImage = useUploadMemberProfileImage();
  const deleteProfileImage = useDeleteMemberProfileImage();
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState<boolean | null>(
    null
  );
  const [biometricBusy, setBiometricBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getBiometricCapability().then((capability) => {
      if (!cancelled) {
        setBiometricAvailable(capability.isAvailable);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);


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

  const displayName = member?.nickname?.trim() || "";
  const email = member?.email?.trim() || "";
  const joinedOn = formatJoinDate(member?.createdAt);
  const statusKey = member?.memberStatus
    ? (`profile.status.${member.memberStatus}` as const)
    : null;

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

    const nickname = member?.nickname?.trim() || member?.memberId?.trim() || "";

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
          await i18n.changeLanguage(toI18nLanguage(code));
          setLanguagePickerOpen(false);
        },
      }
    );
  };

  const handleBiometricToggle = async (nextEnabled: boolean) => {
    if (biometricBusy || biometricAvailable !== true) {
      return;
    }

    if (!nextEnabled) {
      setBiometricUnlockEnabled(false);
      return;
    }

    setBiometricBusy(true);
    try {
      const result = await promptBiometricUnlock(
        t("profile.biometricLogin")
      );
      if (result.success) {
        setBiometricUnlockEnabled(true);
      }
    } finally {
      setBiometricBusy(false);
    }
  };

  const menuItems: MenuItem[] = [
    {
      key: "settings",
      labelKey: "profile.settings",
      icon: "settings-outline",
      iconColor: "#ff9759",
    },
    {
      key: "notifications",
      labelKey: "profile.notifications",
      icon: "notifications-outline",
      iconColor: "#a995fb",
    },
    {
      key: "language",
      labelKey: "profile.language",
      icon: "globe-outline",
      iconColor: "#9AB87A",
      onPress: () => setLanguagePickerOpen(true),
    },
    {
      key: "biometric",
      labelKey: "profile.biometricLogin",
      icon: "finger-print-outline",
      iconColor: "#569cf6",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {t("profile.title")}
          </Text>
          <Pressable
            onPress={() => router.push("/profile/edit")}
            accessibilityRole="button"
            accessibilityLabel={t("profile.edit")}
            style={({ pressed }) => [
              styles.editButton,
              pressed && styles.pressed,
            ]}
          >
            <FontAwesome5 name="user-edit" size={16} color={PRIMARY} />
          </Pressable>
        </View>

        <View style={styles.identity}>
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
              ) : null}
            </View>
            {isPhotoBusy ? null : (
              <View style={styles.cameraBadge} pointerEvents="none">
                <Entypo name="camera" size={13} color={PRIMARY} />
              </View>
            )}
          </Pressable>

          {displayName ? (
            <Text style={styles.userName} numberOfLines={2}>
              {displayName}
            </Text>
          ) : null}

          {email ? (
            <Text style={styles.email} numberOfLines={2}>
              {email}
            </Text>
          ) : null}
        </View>

        <View style={styles.cardSurface}>
          <Text style={styles.infoTitle} numberOfLines={2}>
            {t("profile.accountInfo")}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel} numberOfLines={2}>
              {t("profile.userStatus")}
            </Text>
            {statusKey ? (
              <View style={styles.statusRow}>
                <Text style={styles.statusText} numberOfLines={2}>
                  {t(statusKey)}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel} numberOfLines={2}>
              {t("profile.memberSince")}
            </Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {joinedOn}
            </Text>
          </View>
        </View>

        <View style={[styles.cardSurface, styles.menuCard]}>
          {menuItems.map((item, index) => {
            const isBiometric = item.key === "biometric";
            const biometricReady = biometricAvailable === true;

            return (
              <View key={item.key}>
                {isBiometric ? (
                  <View style={styles.menuRow}>
                    <View style={styles.menuLeft}>
                      <View
                        style={[
                          styles.menuIconBox,
                          { backgroundColor: `${item.iconColor}55` },
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={20}
                          color={item.iconColor}
                        />
                      </View>
                      <View style={styles.menuTextWrap}>
                        <Text style={styles.menuLabel} numberOfLines={2}>
                          {t(
                            biometricAvailable === false
                              ? "profile.biometricProtection"
                              : item.labelKey
                          )}
                        </Text>
                        {biometricAvailable === false ? (
                          <Text style={styles.menuValue} numberOfLines={2}>
                            {t("profile.biometricUnavailable")}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    {biometricReady ? (
                      <Switch
                        value={biometricUnlockEnabled}
                        onValueChange={(value) => {
                          void handleBiometricToggle(value);
                        }}
                        disabled={biometricBusy}
                        trackColor={{ false: "#E5E7EB", true: PRIMARY }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor="#E5E7EB"
                      />
                    ) : biometricAvailable === null ? (
                      <ActivityIndicator size="small" color={PRIMARY} />
                    ) : null}
                  </View>
                ) : (
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
                      <View
                        style={[
                          styles.menuIconBox,
                          {
                            backgroundColor:
                              item.iconColor === "#F8F991"
                                ? "#4B644A"
                                : `${item.iconColor}55`,
                          },
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={20}
                          color={item.iconColor}
                        />
                      </View>
                      <View style={styles.menuTextWrap}>
                        <Text style={styles.menuLabel} numberOfLines={2}>
                          {t(item.labelKey)}
                        </Text>
                        {item.key === "language" ? (
                          <Text style={styles.menuValue} numberOfLines={1}>
                            {t(
                              `profile.editPage.languages.${selectedLanguage}`
                            )}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#C5C8D6"
                    />
                  </Pressable>
                )}
                {index < menuItems.length - 1 ? (
                  <View style={styles.menuDivider} />
                ) : null}
              </View>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("profile.logout")}
          disabled={isPending}
          onPress={() => logout()}
          style={({ pressed }) => [
            styles.cardSurface,
            styles.logoutCard,
            pressed && styles.pressed,
            isPending && styles.disabled,
          ]}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconBox, styles.logoutIconBox]}>
              <Ionicons name="exit-outline" size={20} color={LOGOUT} />
            </View>
            <Text style={styles.logoutLabel} numberOfLines={2}>
              {t("profile.logout")}
            </Text>
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
                    numberOfLines={1}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 28,
  },
  title: {
    flex: 1,
    fontSize: 28,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: TITLE_COLOR,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",

  },
  identity: {
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 28,
  },
  avatarPressable: {
    marginBottom: 16,
    padding: 4,
  },
  avatarRing: {
    width: 150,
    height: 150,
    borderRadius: 999,
    borderWidth: 0,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 150,
    height: 150,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(42, 42, 106, 0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute",
    right: 10,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 14,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    textAlign: "center",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    color: TITLE_COLOR,
  },
  email: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
  },
  statusRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
  },
  statusText: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
    color: TITLE_COLOR,
  },
  cardSurface: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 14,
    shadowColor: "#27265E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  infoTitle: {
    marginBottom: 8,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    color: TITLE_COLOR,
  },
  infoRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoLabel: {
    flexShrink: 1,
    maxWidth: "48%",
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
  },
  infoValueWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  infoValue: {
    flexShrink: 1,
    maxWidth: "100%",
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
    textAlign: "right",
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
  },
  menuCard: {
    paddingHorizontal: 8,
    paddingTop: 0,
    paddingBottom: 0,
  },
  menuRow: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginHorizontal: 10,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  menuTextWrap: {
    flex: 1,
    justifyContent: "center",
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 999,
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
    paddingTop: 0,
    paddingBottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoutIconBox: {
    backgroundColor: "#fff0f0",
    borderRadius: 999,
  },
  logoutLabel: {
    flex: 1,
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
    flex: 1,
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

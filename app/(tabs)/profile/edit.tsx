import i18n from "@/i18n";
import { memberMeQueryKey, useMemberMe } from "@/hooks/useMemberMe";
import { useUpdateMemberMe } from "@/hooks/useUpdateMemberMe";
import { useAuthStore } from "@/store/authStore";
import { useAppStore, type Language } from "@/store/use-language-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_BG = "#F7F8FC";
const TITLE_COLOR = "#27265E";
const MUTED = "#8B8FA8";
const PRIMARY = "#8A6BE8";
const CARD_BG = "#FFFFFF";

const LANGUAGE_OPTIONS: Language[] = ["ko", "mn", "en"];

function normalizeLanguageCode(value: string): Language | "" {
  const code = value.trim().toLowerCase();
  if (code === "en" || code === "mn" || code === "ko") {
    return code;
  }
  return "";
}

export default function ProfileEditScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const setLanguage = useAppStore((state) => state.setLanguage);
  const setMember = useAuthStore((state) => state.setMember);
  const { data, isLoading, isError, refetch, isFetching } = useMemberMe();
  const updateMember = useUpdateMemberMe();
  const [nickname, setNickname] = useState("");
  const [preferredLanguageCode, setPreferredLanguageCode] = useState<
    Language | ""
  >("");
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);

  useEffect(() => {
    if (!data) {
      return;
    }

    setNickname(data.nickname);
    setPreferredLanguageCode(normalizeLanguageCode(data.preferredLanguageCode));
  }, [data]);

  const selectedLanguageLabel = useMemo(() => {
    if (!preferredLanguageCode) {
      return t("profile.editPage.selectLanguage");
    }
    return t(`profile.editPage.languages.${preferredLanguageCode}`);
  }, [preferredLanguageCode, t]);

  const isValid =
    nickname.trim().length > 0 && preferredLanguageCode.length > 0;
  const hasChanges =
    data !== undefined &&
    (nickname.trim() !== data.nickname ||
      preferredLanguageCode !==
        normalizeLanguageCode(data.preferredLanguageCode));

  const handleSave = () => {
    if (!isValid || !preferredLanguageCode || updateMember.isPending) {
      return;
    }

    const selectedLanguage = preferredLanguageCode;

    updateMember.mutate(
      {
        nickname: nickname.trim(),
        preferredLanguageCode: selectedLanguage,
      },
      {
        onSuccess: async (member) => {
          // Keep the language the user selected; API may still echo an old code.
          const patchedMember = {
            ...member,
            preferredLanguageCode: selectedLanguage,
          };

          queryClient.setQueryData(memberMeQueryKey, patchedMember);
          setMember(patchedMember);
          setNickname(patchedMember.nickname);
          setPreferredLanguageCode(selectedLanguage);
          setLanguage(selectedLanguage);
          await i18n.changeLanguage(selectedLanguage);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>{t("profile.editPage.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>{t("profile.editPage.loadFailed")}</Text>
          <Text style={styles.errorBody}>
            {t("profile.editPage.loadFailedBody")}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("profile.editPage.retry")}
            onPress={() => {
              void refetch();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
              isFetching && styles.disabled,
            ]}
          >
            <Text style={styles.retryText}>{t("profile.editPage.retry")}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/profile");
              }
            }}
            style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
          >
            <Text style={styles.backLinkText}>{t("profile.editPage.back")}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <EditableField
            label={t("profile.editPage.nickname")}
            value={nickname}
            onChangeText={setNickname}
            autoCapitalize="words"
            maxLength={30}
          />

          <LanguageSelectField
            label={t("profile.editPage.preferredLanguage")}
            valueLabel={selectedLanguageLabel}
            hasValue={preferredLanguageCode.length > 0}
            onPress={() => setLanguagePickerOpen(true)}
          />
        </View>

        {!isValid ? (
          <Text style={styles.validationText}>
            {t("profile.editPage.validation")}
          </Text>
        ) : null}

        {updateMember.isError ? (
          <Text style={styles.updateError}>
            {t("profile.editPage.updateFailed")}
          </Text>
        ) : null}

        {updateMember.isSuccess && !hasChanges ? (
          <Text style={styles.successText}>
            {t("profile.editPage.updateSuccess")}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("profile.editPage.save")}
          disabled={!isValid || !hasChanges || updateMember.isPending}
          onPress={handleSave}
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressed,
            (!isValid || !hasChanges || updateMember.isPending) &&
              styles.disabled,
          ]}
        >
          {updateMember.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {t("profile.editPage.save")}
            </Text>
          )}
        </Pressable>
      </ScrollView>

      <Modal
        visible={languagePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguagePickerOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setLanguagePickerOpen(false)}
        >
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>
              {t("profile.editPage.selectLanguage")}
            </Text>

            {LANGUAGE_OPTIONS.map((code) => {
              const selected = preferredLanguageCode === code;
              return (
                <Pressable
                  key={code}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setPreferredLanguageCode(code);
                    setLanguagePickerOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.optionRow,
                    selected && styles.optionRowSelected,
                    pressed && styles.pressed,
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
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function EditableField({
  label,
  value,
  onChangeText,
  autoCapitalize,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  autoCapitalize: "none" | "sentences" | "words" | "characters";
  maxLength: number;
}) {
  return (
    <View style={[styles.field, styles.fieldBorder]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        maxLength={maxLength}
        style={styles.fieldInput}
      />
    </View>
  );
}

function LanguageSelectField({
  label,
  valueLabel,
  hasValue,
  onPress,
}: {
  label: string;
  valueLabel: string;
  hasValue: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.field, pressed && styles.pressed]}
    >
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.selectRow}>
        <Text
          style={[styles.fieldValue, !hasValue && styles.fieldPlaceholder]}
        >
          {valueLabel}
        </Text>
        <Ionicons name="chevron-down" size={18} color={MUTED} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 10,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: MUTED,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: TITLE_COLOR,
    textAlign: "center",
  },
  errorBody: {
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
    textAlign: "center",
    marginBottom: 8,
  },
  retryButton: {
    marginTop: 8,
    minHeight: 48,
    paddingHorizontal: 24,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  backLink: {
    marginTop: 8,
    paddingVertical: 8,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    paddingHorizontal: 18,
    shadowColor: "#27265E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  field: {
    paddingVertical: 16,
  },
  fieldBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECECF3",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: MUTED,
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 17,
    fontWeight: "600",
    color: TITLE_COLOR,
  },
  fieldPlaceholder: {
    color: MUTED,
    fontWeight: "500",
  },
  fieldInput: {
    minHeight: 28,
    padding: 0,
    fontSize: 17,
    fontWeight: "600",
    color: TITLE_COLOR,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  validationText: {
    marginTop: 12,
    paddingHorizontal: 4,
    fontSize: 13,
    color: "#D35A5A",
  },
  updateError: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 14,
    color: "#D35A5A",
  },
  successText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 14,
    color: "#3A9B69",
  },
  saveButton: {
    minHeight: 52,
    marginTop: 20,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(23, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: CARD_BG,
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
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});

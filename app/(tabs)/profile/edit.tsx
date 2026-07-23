import { useMemberMe } from "@/hooks/useMemberMe";
import { useUpdateMemberMe } from "@/hooks/useUpdateMemberMe";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

export default function ProfileEditScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading, isError, refetch, isFetching } = useMemberMe();
  const updateMember = useUpdateMemberMe();
  const [nickname, setNickname] = useState("");
  const [preferredLanguageCode, setPreferredLanguageCode] = useState("");

  useEffect(() => {
    if (!data) {
      return;
    }

    setNickname(data.nickname);
    setPreferredLanguageCode(data.preferredLanguageCode);
  }, [data]);

  const isValid =
    nickname.trim().length > 0 &&
    preferredLanguageCode.trim().length >= 2;
  const hasChanges =
    data !== undefined &&
    (nickname.trim() !== data.nickname ||
      preferredLanguageCode.trim() !== data.preferredLanguageCode);

  const handleSave = () => {
    if (!isValid || updateMember.isPending) {
      return;
    }

    updateMember.mutate(
      {
        nickname,
        preferredLanguageCode,
      },
      {
        onSuccess: (member) => {
          setNickname(member.nickname);
          setPreferredLanguageCode(member.preferredLanguageCode);
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
            maxLength={50}
          />
          <ReadOnlyField
            label={t("profile.editPage.memberId")}
            value={data.memberId?.trim() || "—"}
          />
          <EditableField
            label={t("profile.editPage.preferredLanguage")}
            value={preferredLanguageCode}
            onChangeText={setPreferredLanguageCode}
            autoCapitalize="characters"
            maxLength={10}
            last
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
    </SafeAreaView>
  );
}

function EditableField({
  label,
  value,
  onChangeText,
  autoCapitalize,
  maxLength,
  last = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  autoCapitalize: "none" | "sentences" | "words" | "characters";
  maxLength: number;
  last?: boolean;
}) {
  return (
    <View style={[styles.field, !last && styles.fieldBorder]}>
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

function ReadOnlyField({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.field, !last && styles.fieldBorder]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
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
  fieldInput: {
    minHeight: 28,
    padding: 0,
    fontSize: 17,
    fontWeight: "600",
    color: TITLE_COLOR,
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
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});

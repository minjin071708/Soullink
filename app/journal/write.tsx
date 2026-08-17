import { CauseTagsSection } from "@/components/journal/CauseTagsSection";
import { VoiceJournalPanel } from "@/components/journal/VoiceJournalPanel";
import { MoodPicker } from "@/components/mood/MoodPicker";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useDayNightPeriod } from "@/hooks/use-day-night-period";
import { useCreateJournal } from "@/hooks/useCreateJournal";
import { useJournalResult } from "@/hooks/useJournalResult";
import { useUpdateEmotionDiary } from "@/hooks/useUpdateEmotionDiary";
import type { JournalInputMode } from "@/types/journalType";
import type { MoodId } from "@/types/moodType";
import { getMoodItem, isMoodId, parseMoodParam } from "@/utils/mood";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { AxiosError } from "axios";
import { Image } from "expo-image";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
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

const DAY_BG = "#f7f8fc";
const NIGHT_BG = "#3c3866";
const DAY_TEXT = "#2A2A6A";
const NIGHT_TEXT = "#FFFFFF";
const MUTED_DAY = "#6E6E8A";
const MUTED_NIGHT = "rgba(255,255,255,0.72)";
const PRIMARY = "#8A6BE8";
const INPUT_BG_DAY = "#FFFFFF";
const INPUT_BG_NIGHT = "rgba(255,255,255,0.08)";
const BORDER_DAY = "#E4E0F5";
const BORDER_NIGHT = "rgba(255,255,255,0.16)";

const INPUT_MODES: JournalInputMode[] = ["text", "voice"];

function parseDiaryIdParam(
  value: string | string[] | undefined
): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return undefined;
  }

  const diaryId = Number(raw);
  return Number.isInteger(diaryId) && diaryId > 0 ? diaryId : undefined;
}

export default function JournalWriteScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const toast = useToast();
  const period = useDayNightPeriod();
  const params = useLocalSearchParams<{
    mood?: string | string[];
    diaryId?: string | string[];
  }>();

  const diaryId = parseDiaryIdParam(params.diaryId);
  const isEditMode = diaryId !== undefined;
  const initialMood = parseMoodParam(params.mood);

  const [selectedMood, setSelectedMood] = useState<MoodId | undefined>(
    initialMood
  );
  const [isChoosingMood, setIsChoosingMood] = useState(!initialMood && !isEditMode);
  const [inputMode, setInputMode] = useState<JournalInputMode>("text");
  /** Tracks whether content originated from voice STT (for create payload). */
  const [contentSource, setContentSource] =
    useState<JournalInputMode>("text");
  const [journalText, setJournalText] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [hasHydratedEdit, setHasHydratedEdit] = useState(!isEditMode);

  const mood = selectedMood;
  const moodItem = mood ? getMoodItem(mood) : undefined;

  const editQuery = useJournalResult(diaryId);
  const { mutate: createJournal, isPending: isCreating } = useCreateJournal();
  const { mutate: updateDiary, isPending: isUpdating } = useUpdateEmotionDiary();
  const isPending = isCreating || isUpdating;

  const isNight = period === "night";
  const backgroundColor = isNight ? NIGHT_BG : DAY_BG;
  const textColor = isNight ? NIGHT_TEXT : DAY_TEXT;
  const mutedColor = isNight ? MUTED_NIGHT : MUTED_DAY;
  const inputBackground = isNight ? INPUT_BG_NIGHT : INPUT_BG_DAY;
  const borderColor = isNight ? BORDER_NIGHT : BORDER_DAY;

  useEffect(() => {
    navigation.setOptions({
      title: isEditMode
        ? t("journal.write.editTitle")
        : t("journal.write.title"),
    });
  }, [isEditMode, navigation, t]);

  useEffect(() => {
    if (!isEditMode || !editQuery.data || hasHydratedEdit) {
      return;
    }

    const emotionCode = editQuery.data.emotionCode?.toUpperCase();
    if (emotionCode && isMoodId(emotionCode)) {
      setSelectedMood(emotionCode);
      setIsChoosingMood(false);
      router.setParams({ mood: emotionCode });
    }

    setJournalText(editQuery.data.content?.trim() || "");
    setSelectedTagIds(
      (editQuery.data.tags ?? [])
        .map((tag) => tag.tagId)
        .filter((tagId): tagId is number => Number.isInteger(tagId) && tagId > 0)
    );
    setHasHydratedEdit(true);
  }, [editQuery.data, hasHydratedEdit, isEditMode, router]);

  const canSubmit =
    Boolean(mood) &&
    inputMode === "text" &&
    journalText.trim().length > 0 &&
    !isPending &&
    (!isEditMode || hasHydratedEdit);

  const showErrorToast = (
    message: string,
    options?: { title?: string; requestId?: string }
  ) => {
    const detail =
      options?.requestId && options.requestId.trim()
        ? `${message}\n(${options.requestId})`
        : message;

    toast.show({
      placement: "top",
      duration: 4000,
      render: ({ id }) => (
        <Toast
          nativeID={`journal-write-error-${id}`}
          action="error"
          variant="solid"
          className="px-14 py-6 gap-6 shadow-soft-1 flex-row bg-white"
        >
          <MaterialIcons name="error-outline" size={32} color="red" />
          <VStack space="xs">
            <ToastTitle size="md">
              {options?.title ??
                (isEditMode
                  ? t("journal.write.updateFailed")
                  : t("journal.write.submitFailed"))}
            </ToastTitle>
            <ToastDescription size="md">{detail}</ToastDescription>
          </VStack>
        </Toast>
      ),
    });
  };

  const showSuccessToast = (message: string) => {
    toast.show({
      placement: "top",
      duration: 3000,
      render: ({ id }) => (
        <Toast
          nativeID={`journal-write-success-${id}`}
          action="success"
          variant="solid"
          className="px-14 py-6 gap-6 shadow-soft-1 flex-row bg-white"
        >
          <MaterialIcons name="check-circle-outline" size={32} color="#3A9B69" />
          <VStack space="xs">
            <ToastTitle size="md">{t("journal.write.updateSuccess")}</ToastTitle>
            <ToastDescription size="md">{message}</ToastDescription>
          </VStack>
        </Toast>
      ),
    });
  };

  const handleMoodSelect = (nextMood: MoodId) => {
    setSelectedMood(nextMood);
    setIsChoosingMood(false);
    router.setParams({ mood: nextMood });
  };

  const handleSubmit = () => {
    if (!mood || inputMode !== "text" || !journalText.trim()) {
      return;
    }

    if (isEditMode && diaryId !== undefined) {
      updateDiary(
        {
          diaryId,
          payload: {
            content: journalText.trim(),
            emotionCode: mood,
            tagIds: selectedTagIds,
          },
        },
        {
          onSuccess: () => {
            showSuccessToast(t("journal.write.updateSuccessBody"));
            router.replace("/calendar-tab");
          },
          onError: (error) => {
            const axiosError = error as AxiosError<{ message?: string }>;
            const message =
              axiosError.response?.data?.message ??
              (error instanceof Error
                ? error.message
                : t("journal.write.submitError"));
            showErrorToast(message);
          },
        }
      );
      return;
    }

    createJournal(
      {
        mood,
        content: journalText.trim(),
        inputMode: contentSource,
        tagIds: selectedTagIds,
      },
      {
        onSuccess: (response) => {
          router.replace({
            pathname: "/journal/success",
            params: { diaryId: String(response.data.diaryId) },
          });
        },
        onError: (error) => {
          const axiosError = error as AxiosError<{ message?: string }>;
          const message =
            axiosError.response?.data?.message ??
            (error instanceof Error
              ? error.message
              : t("journal.write.submitError"));
          showErrorToast(message);
        },
      }
    );
  };

  if (isEditMode && editQuery.isLoading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor }]}
        edges={["bottom"]}
      >
        <View style={[styles.centered, { backgroundColor }]}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={[styles.loadingText, { color: mutedColor }]}>
            {t("journal.write.loadingEdit")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isEditMode && (editQuery.isError || (!editQuery.isLoading && !editQuery.data))) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor }]}
        edges={["bottom"]}
      >
        <View style={[styles.container, { backgroundColor }]}>
          <Text style={[styles.invalidTitle, { color: textColor }]}>
            {t("journal.write.loadEditFailed")}
          </Text>
          <Text style={[styles.invalidBody, { color: mutedColor }]}>
            {t("journal.write.loadEditFailedBody")}
          </Text>
          <Button variant="default" onPress={() => router.replace("/calendar-tab")}>
            <ButtonText>{t("journal.write.backToCalendar")}</ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!mood || !moodItem) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor }]}
        edges={["bottom"]}
      >
        <View style={[styles.container, { backgroundColor }]}>
          <Text style={[styles.invalidTitle, { color: textColor }]}>
            {t("journal.write.invalidMoodTitle")}
          </Text>
          <Text style={[styles.invalidBody, { color: mutedColor }]}>
            {t("journal.write.invalidMoodBody")}
          </Text>
          <MoodPicker
            title={t("journal.write.chooseMood")}
            selectedMoodId={selectedMood}
            onSelect={handleMoodSelect}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.container, { backgroundColor }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("journal.write.changeMood")}
              accessibilityState={{ expanded: isChoosingMood }}
              onPress={() => setIsChoosingMood((open) => !open)}
              style={({ pressed }) => [
                styles.moodCard,
                { borderColor, backgroundColor: inputBackground },
                pressed && styles.moodCardPressed,
              ]}
            >
              <Image
                source={moodItem.image}
                style={styles.moodImage}
                contentFit="contain"
              />
              <View style={styles.moodCopy}>
                <Text style={[styles.moodLabel, { color: mutedColor }]}>
                  {t("journal.write.selectedMood")}
                </Text>
                <Text style={[styles.moodValue, { color: textColor }]}>
                  {t(moodItem.labelKey)}
                </Text>
                <Text style={[styles.changeMoodHint, { color: PRIMARY }]}>
                  {t("journal.write.changeMood")}
                </Text>
              </View>
              <Ionicons
                name={isChoosingMood ? "chevron-up" : "chevron-down"}
                size={20}
                color={mutedColor}
              />
            </Pressable>

            {isChoosingMood ? (
              <View
                style={[
                  styles.moodPickerPanel,
                  { borderColor, backgroundColor: inputBackground },
                ]}
              >
                <MoodPicker
                  showTitle={false}
                  selectedMoodId={mood}
                  onSelect={handleMoodSelect}
                />
              </View>
            ) : null}

            <Text style={[styles.sectionTitle, { color: textColor }]}>
              {t("journal.write.inputMode")}
            </Text>

            <View style={styles.modeRow}>
              {INPUT_MODES.map((mode) => {
                const isActive = inputMode === mode;

                return (
                  <Pressable
                    key={mode}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    onPress={() => setInputMode(mode)}
                    style={[
                      styles.modeButton,
                      {
                        borderColor,
                        backgroundColor: isActive ? PRIMARY : inputBackground,
                      },
                    ]}
                  >
                    <Ionicons
                      name={mode === "text" ? "create-outline" : "mic-outline"}
                      size={18}
                      color={isActive ? "#FFFFFF" : textColor}
                    />
                    <Text
                      style={[
                        styles.modeButtonText,
                        { color: isActive ? "#FFFFFF" : textColor },
                      ]}
                    >
                      {t(`journal.write.mode.${mode}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {inputMode === "text" ? (
              <>
                <TextInput
                  value={journalText}
                  onChangeText={(next) => {
                    setJournalText(next);
                    if (contentSource === "voice" && next.trim().length === 0) {
                      setContentSource("text");
                    }
                  }}
                  placeholder={t("journal.write.textPlaceholder")}
                  placeholderTextColor={mutedColor}
                  multiline
                  textAlignVertical="top"
                  style={[
                    styles.textInput,
                    {
                      color: textColor,
                      backgroundColor: inputBackground,
                      borderColor,
                    },
                  ]}
                />
                <CauseTagsSection
                  selectedTagIds={selectedTagIds}
                  onChange={setSelectedTagIds}
                />
              </>
            ) : (
              <VoiceJournalPanel
                textColor={textColor}
                mutedColor={mutedColor}
                inputBackground={inputBackground}
                borderColor={borderColor}
                onDismiss={() => setInputMode("text")}
                onTranscribed={(transcription) => {
                  setJournalText(transcription);
                  setContentSource("voice");
                  setInputMode("text");
                  toast.show({
                    placement: "top",
                    duration: 2500,
                    render: ({ id }) => (
                      <Toast
                        nativeID={`journal-voice-ok-${id}`}
                        action="success"
                        variant="solid"
                        className="px-14 py-6 gap-6 shadow-soft-1 flex-row bg-white"
                      >
                        <MaterialIcons
                          name="check-circle-outline"
                          size={32}
                          color="#3A9B69"
                        />
                        <VStack space="xs">
                          <ToastTitle size="md">
                            {t("journal.write.voiceTranscribeSuccess")}
                          </ToastTitle>
                          <ToastDescription size="md">
                            {t("journal.write.voiceTranscribeSuccessBody")}
                          </ToastDescription>
                        </VStack>
                      </Toast>
                    ),
                  });
                }}
                onError={(message, requestId) => {
                  showErrorToast(message, {
                    title: t("journal.write.voiceTranscribeFailed"),
                    requestId,
                  });
                }}
              />
            )}

            <Button
              variant="default"
              className="mt-6 min-h-12"
              size="lg"
              disabled={!canSubmit}
              onPress={handleSubmit}
            >
              {isPending ? (
                <ButtonSpinner />
              ) : (
                <AntDesign name="send" size={20} color="#FFFFFF" />
              )}
              <ButtonText className="text-lg font-bold">
                {isEditMode
                  ? t("journal.write.saveChanges")
                  : t("journal.write.submit")}
              </ButtonText>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 14,
  },
  invalidTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  invalidBody: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  moodCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
  },
  moodCardPressed: {
    opacity: 0.88,
  },
  moodImage: {
    width: 52,
    height: 52,
  },
  moodCopy: {
    flex: 1,
  },
  moodLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  moodValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  changeMoodHint: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
  },
  moodPickerPanel: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 14,
    marginTop: -12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  modeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  textInput: {
    minHeight: 180,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 24,
  },
});

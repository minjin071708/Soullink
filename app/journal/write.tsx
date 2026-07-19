import { MoodPicker } from "@/components/mood/MoodPicker";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { VStack } from "@/components/ui/vstack";
import { useCreateJournal } from "@/hooks/useCreateJournal";
import { useDayNightPeriod } from "@/hooks/use-day-night-period";
import type { JournalInputMode } from "@/types/journalType";
import type { MoodId } from "@/types/moodType";
import { getMoodItem, parseMoodParam } from "@/utils/mood";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AxiosError } from "axios";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
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

export default function JournalWriteScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const period = useDayNightPeriod();
  const params = useLocalSearchParams<{
    mood?: string | string[];
  }>();

  const initialMood = parseMoodParam(params.mood);

  const [selectedMood, setSelectedMood] = useState<MoodId | undefined>(
    initialMood
  );
  const [isChoosingMood, setIsChoosingMood] = useState(!initialMood);
  const [inputMode, setInputMode] = useState<JournalInputMode>("text");
  const [journalText, setJournalText] = useState("");

  const mood = selectedMood;
  const moodItem = mood ? getMoodItem(mood) : undefined;

  const { mutate: createJournal, isPending } = useCreateJournal();

  const isNight = period === "night";
  const backgroundColor = isNight ? NIGHT_BG : DAY_BG;
  const textColor = isNight ? NIGHT_TEXT : DAY_TEXT;
  const mutedColor = isNight ? MUTED_NIGHT : MUTED_DAY;
  const inputBackground = isNight ? INPUT_BG_NIGHT : INPUT_BG_DAY;
  const borderColor = isNight ? BORDER_NIGHT : BORDER_DAY;

  const canSubmit =
    Boolean(mood) &&
    inputMode === "text" &&
    journalText.trim().length > 0 &&
    !isPending;

  const handleMoodSelect = (nextMood: MoodId) => {
    setSelectedMood(nextMood);
    setIsChoosingMood(false);
    router.setParams({ mood: nextMood });
  };

  const handleSubmit = () => {
    if (!mood || inputMode !== "text" || !journalText.trim()) {
      return;
    }

    createJournal(
      {
        mood,
        content: journalText.trim(),
        inputMode,
      },
      {
        onSuccess: (response) => {
          router.replace({
            pathname: "/journal/result",
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

          toast.show({
            placement: "top",
            duration: 4000,
            render: ({ id }) => (
              <Toast
                nativeID={`journal-submit-error-${id}`}
                action="error"
                variant="solid"
                className="px-14 py-6 gap-6 shadow-soft-1 flex-row bg-white"
              >
                <MaterialIcons name="error-outline" size={32} color="red" />
                <VStack space="xs">
                  <ToastTitle size="md">{t("journal.write.submitFailed")}</ToastTitle>
                  <ToastDescription size="md">{message}</ToastDescription>
                </VStack>
              </Toast>
            ),
          });
        },
      }
    );
  };

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
              <TextInput
                value={journalText}
                onChangeText={setJournalText}
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
            ) : (
              <View
                style={[
                  styles.voicePlaceholder,
                  { backgroundColor: inputBackground, borderColor },
                ]}
              >
                <Ionicons name="mic-outline" size={36} color={PRIMARY} />
                <Text style={[styles.voiceTitle, { color: textColor }]}>
                  {t("journal.write.voiceTitle")}
                </Text>
                <Text style={[styles.voiceBody, { color: mutedColor }]}>
                  {t("journal.write.voiceBody")}
                </Text>
              </View>
            )}

            <Button
              variant="default"
              className="mt-6"
              disabled={!canSubmit}
              onPress={handleSubmit}
            >
              {isPending ? <ButtonSpinner /> : null}
              <ButtonText>{t("journal.write.submit")}</ButtonText>
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
  voicePlaceholder: {
    minHeight: 180,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 8,
  },
  voiceTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  voiceBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});

import { MoodPicker } from "@/components/mood/MoodPicker";
import type { MoodId } from "@/types/moodType";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_BG = "#f7f8fc";

export default function JournalMoodScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);

  const handleMoodSelect = (mood: MoodId) => {
    setSelectedMood(mood);

    setTimeout(() => {
      router.push({
        pathname: "/journal/write",
        params: { mood },
      });
    }, 140);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <View style={styles.content}>
        <MoodPicker
          title={t("home.howAreYouFeeling")}
          selectedMoodId={selectedMood ?? undefined}
          onSelect={handleMoodSelect}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
});

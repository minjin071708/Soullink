import { MoodPicker } from "@/components/mood/MoodPicker";
import { useDayNightTheme } from "@/components/day-night/DayNightProvider";
import type { MoodId } from "@/types/moodType";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JournalMoodScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors: themeColors } = useDayNightTheme();
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const backgroundColor = themeColors.background;

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
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={["bottom"]}
    >
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
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
});

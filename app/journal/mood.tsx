import { MoodPicker } from "@/components/mood/MoodPicker";
import { useDayNightPeriod } from "@/hooks/use-day-night-period";
import type { MoodId } from "@/types/moodType";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DAY_BG = "#f7f8fc";
const NIGHT_BG = "#3c3866";

export default function JournalMoodScreen() {
  const router = useRouter();
  const period = useDayNightPeriod();
  const isNight = period === "night";
  const backgroundColor = isNight ? NIGHT_BG : DAY_BG;

  const handleMoodSelect = (mood: MoodId) => {
    router.push({
      pathname: "/journal/write",
      params: { mood },
    });
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={["bottom"]}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <MoodPicker onSelect={handleMoodSelect} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});

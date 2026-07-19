import { MOODS } from "@/constants/moods";
import { useDayNightPeriod } from "@/hooks/use-day-night-period";
import type { MoodId } from "@/types/moodType";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

const DAY_TEXT = "#2A2A6A";
const NIGHT_TEXT = "#FFFFFF";
const MOOD_CIRCLE_DAY = "#EDE7FF";
const MOOD_CIRCLE_NIGHT = "rgba(255,255,255,0.14)";
const MOOD_SELECTED_RING = "#8A6BE8";

type MoodPickerProps = {
  onSelect: (mood: MoodId) => void;
  title?: string;
  selectedMoodId?: MoodId;
  showTitle?: boolean;
};

export function MoodPicker({
  onSelect,
  title,
  selectedMoodId,
  showTitle = true,
}: MoodPickerProps) {
  const { t } = useTranslation();
  const period = useDayNightPeriod();
  const isNight = period === "night";
  const textColor = isNight ? NIGHT_TEXT : DAY_TEXT;
  const moodCircleColor = isNight ? MOOD_CIRCLE_NIGHT : MOOD_CIRCLE_DAY;

  return (
    <View style={styles.container}>
      {showTitle ? (
        <Text style={[styles.title, { color: textColor }]}>
          {title ?? t("home.howAreYouFeeling")}
        </Text>
      ) : null}

      <View style={styles.moodRow}>
        {MOODS.map((mood) => {
          const isSelected = mood.id === selectedMoodId;

          return (
          <Pressable
            key={mood.id}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={t(mood.labelKey)}
            onPress={() => onSelect(mood.id)}
            style={({ pressed }) => [
              styles.moodItem,
              pressed && styles.moodPressed,
            ]}
          >
            <View
              style={[
                styles.moodCircle,
                { backgroundColor: moodCircleColor },
                isSelected && styles.moodCircleSelected,
              ]}
            >
              <Image
                source={mood.image}
                style={styles.moodImage}
                contentFit="contain"
              />
            </View>
            <Text
              style={[
                styles.moodLabel,
                { color: textColor },
                isSelected && styles.moodLabelSelected,
              ]}
            >
              {t(mood.labelKey)}
            </Text>
          </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 18,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700",
    letterSpacing: -0.4,
    textTransform: "capitalize",
  },
  moodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 2,
  },
  moodItem: {
    flex: 1,
    alignItems: "center",
  },
  moodPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.96 }],
  },
  moodCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  moodCircleSelected: {
    borderWidth: 2,
    borderColor: MOOD_SELECTED_RING,
  },
  moodImage: {
    width: "100%",
    height: "100%",
  },
  moodLabel: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  moodLabelSelected: {
    fontWeight: "700",
  },
});

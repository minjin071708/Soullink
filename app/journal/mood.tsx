import { MOODS } from "@/constants/moods";
import { useDayNightTheme } from "@/components/day-night/DayNightProvider";
import type { MoodId } from "@/types/moodType";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DAY_CARD = "rgba(255,255,255,0.88)";
const NIGHT_CARD = "rgba(255,255,255,0.08)";
const DAY_BORDER = "rgba(138,107,232,0.12)";
const NIGHT_BORDER = "rgba(255,255,255,0.12)";
const SELECTED_BORDER = "#A884FF";
const SELECTED_FILL = "#A884FF";

const MOOD_CARD_COLORS: Record<
  MoodId,
  { tint: string; glow: string }
> = {
  ANGRY: { tint: "#F8F0FF", glow: "#F0E5FF" },
  ANXIOUS: { tint: "#F1F6FF", glow: "#E7F0FF" },
  CALM: { tint: "#F7F4FF", glow: "#EEE7FF" },
  HAPPY: { tint: "#FFF8E8", glow: "#FFF0C7" },
  SAD: { tint: "#F1F6FF", glow: "#E7F0FF" },
  TIRED: { tint: "#FBF4FF", glow: "#F4E7FF" },
};

export default function JournalMoodScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { colors: themeColors, isNight } = useDayNightTheme();
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const backgroundColor = themeColors.background;
  const textColor = themeColors.text;
  const mutedColor = isNight ? themeColors.mutedText : "#7D8097";

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
      <ScrollView
        style={{ backgroundColor }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: textColor }]}>
          {t("home.howAreYouFeeling")}
        </Text>

        <View style={styles.cardList}>
          {MOODS.map((mood) => {
            const isSelected = selectedMood === mood.id;
            const colors = MOOD_CARD_COLORS[mood.id];

            return (
              <Pressable
                key={mood.id}
                accessibilityRole="button"
                accessibilityLabel={t(mood.labelKey)}
                accessibilityState={{ selected: isSelected }}
                onPress={() => handleMoodSelect(mood.id)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: isNight ? NIGHT_CARD : DAY_CARD,
                    borderColor: isSelected
                      ? SELECTED_BORDER
                      : isNight
                        ? NIGHT_BORDER
                        : DAY_BORDER,
                    shadowColor: isSelected ? "#B191FF" : "#31285F",
                  },
                  !isNight && {
                    shadowOpacity: isSelected ? 0.14 : 0.06,
                  },
                  pressed && styles.cardPressed,
                ]}
              >
                <View
                  style={[
                    styles.leadingOrb,
                    {
                      backgroundColor: isNight
                        ? "rgba(255,255,255,0.12)"
                        : colors.glow,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.leadingTint,
                      {
                        backgroundColor: isNight
                          ? "rgba(255,255,255,0.08)"
                          : colors.tint,
                      },
                    ]}
                  />
                  <Image
                    source={mood.image}
                    style={styles.moodImage}
                    contentFit="contain"
                  />
                </View>

                <View style={styles.textBlock}>
                  <Text style={[styles.moodTitle, { color: textColor }]}>
                    {t(mood.labelKey)}
                  </Text>
                  <Text style={[styles.moodSubtitle, { color: mutedColor }]}>
                    {t(`journal.mood.options.${mood.id}.subtitle`)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.trailingCircle,
                    {
                      borderColor: isSelected ? SELECTED_FILL : "#A884FF",
                      backgroundColor: isSelected ? SELECTED_FILL : "transparent",
                    },
                  ]}
                >
                  <Ionicons
                    name={isSelected ? "checkmark" : "chevron-forward"}
                    size={isSelected ? 22 : 20}
                    color={isSelected ? "#FFFFFF" : "#7F58E7"}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
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
  title: {
    marginBottom: 24,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  cardList: {
    gap: 16,
  },
  card: {
    minHeight: 136,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
  },
  leadingOrb: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: 16,
  },
  leadingTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 38,
  },
  moodImage: {
    width: 76,
    height: 76,
  },
  textBlock: {
    flex: 1,
    paddingRight: 12,
  },
  moodTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  moodSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  trailingCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});

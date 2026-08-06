import { GreetingSection } from "@/components/home/GreetingSection";
import { SimilarStoriesSection } from "@/components/home/SimilarStoriesSection";
import { WeeklyInsightCard } from "@/components/home/WeeklyInsightCard";
import { WeeklyMoodJourneyCard } from "@/components/home/WeeklyMoodJourneyCard";
import { MOODS } from "@/constants/moods";
import { useDayNightPeriod } from "@/hooks/use-day-night-period";
import { useAuthStore } from "@/store/authStore";
import type { MoodId } from "@/types/moodType";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const DAY_SCREEN_BG = "#F3E5D9";
const NIGHT_SCREEN_BG = "#D0c0c7";
const CONTENT_TEXT = "#2A2A6A";
const GLASS_CARD_PADDING = 18;
const CONTENT_HORIZONTAL_PADDING = 20;

type GreetingKey = "Good Morning" | "Good Afternoon" | "Good Evening";

function getGreetingKey(date: Date = new Date()): {
  key: GreetingKey;
  emoji: string;
} {
  const hour = date.getHours();

  if (hour >= 6 && hour < 12) {
    return { key: "Good Morning", emoji: "☀️" };
  }

  if (hour >= 12 && hour < 18) {
    return { key: "Good Afternoon", emoji: "🌤️" };
  }

  return { key: "Good Evening", emoji: "🌙" };
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const member = useAuthStore((state) => state.member);
  const period = useDayNightPeriod();
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);

  const displayName =
    member?.nickname?.trim() ||
    member?.memberId?.trim() ||
    t("home.friend");

  const greeting = getGreetingKey();
  const screenBackground =
    period === "night" ? NIGHT_SCREEN_BG : DAY_SCREEN_BG;

  const handleMoodPress = (mood: MoodId) => {
    setSelectedMood(mood);

    setTimeout(() => {
      router.push({
        pathname: "/journal/write",
        params: { mood },
      });
    }, 140);
  };

  return (
    <View style={[styles.screen, { backgroundColor: screenBackground }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <GreetingSection
          greeting={`${t(greeting.key)},`}
          username={displayName}
          greetingIcon={greeting.emoji}
        />

        <View style={[styles.content, { backgroundColor: screenBackground }]}>
          <View style={styles.glassCard}>
           

            <Text style={styles.glassTitle}>
              {t("home.howAreYouFeeling")}
            </Text>
            <Text style={styles.glassSubtitle}>
              {t("home.chooseYourFeeling")}
            </Text>

            <View style={styles.moodGrid}>
              {MOODS.map((mood) => {
                const isSelected = selectedMood === mood.id;

                return (
                  <Pressable
                    key={mood.id}
                    accessibilityRole="button"
                    accessibilityLabel={t(mood.labelKey)}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => handleMoodPress(mood.id)}
                    style={({ pressed }) => [
                      styles.moodPill,
                      {
                        borderColor: isSelected
                          ? "rgba(255, 255, 255, 0.55)"
                          : "rgba(255,255,255,0.72)",
                      },
                      isSelected && styles.moodPillSelected,
                      pressed && styles.moodPressed,
                    ]}
                  >
                    <View style={styles.moodCircle}>
                      <Image
                        source={mood.image}
                        style={styles.moodImage}
                        contentFit="contain"
                      />
                    </View>
                    <Text style={styles.moodLabel} numberOfLines={1}>
                      {t(mood.labelKey)}
                    </Text>
                    {isSelected ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={CONTENT_TEXT}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <WeeklyMoodJourneyCard />
        </View>

        <WeeklyInsightCard />
        <SimilarStoriesSection />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 12,
  },
  content: {
    paddingHorizontal: CONTENT_HORIZONTAL_PADDING,
    paddingTop: 16,
  },
  glassCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    backgroundColor: "rgba(255, 255, 255, 0.66)",
    padding: GLASS_CARD_PADDING,
    overflow: "hidden",
  },
  glassTitle: {
    color: CONTENT_TEXT,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  glassSubtitle: {
    color: CONTENT_TEXT,
    opacity: 0.68,
    marginTop: 4,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  moodPill: {
    width: "48.5%",
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgb(255, 255, 255)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  moodPillSelected: {
    shadowColor: "#8A6BE8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  moodPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  moodCircle: {
    width: 45,
    height: 45,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  moodImage: {
    width: "100%",
    height: "100%",
  },
  moodLabel: {
    flex: 1,
    color: CONTENT_TEXT,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    textAlign: "left",
  },
});

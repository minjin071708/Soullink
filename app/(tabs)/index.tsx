import { WeeklyMoodJourneyCard } from "@/components/home/WeeklyMoodJourneyCard";
import { MOODS } from "@/constants/moods";
import { useDayNightPeriod } from "@/hooks/use-day-night-period";
import { useAuthStore } from "@/store/authStore";
import type { MoodId } from "@/types/moodType";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DAY_MASCOT = require("@/assets/mascotImages/Day.png");
const NIGHT_MASCOT = require("@/assets/mascotImages/night.png");
const DAY_BG = require("@/assets/images/daybg.png");
const NIGHT_BG = require("@/assets/images/nightBg.png");

const DAY_TEXT = "#2A2A6A";
const NIGHT_TEXT = "#FFFFFF";
const MOOD_CIRCLE_DAY = "#EDE7FF";
const MOOD_CIRCLE_NIGHT = "rgba(255,255,255,0.14)";

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
  const { height: windowHeight } = useWindowDimensions();
  const period = useDayNightPeriod();
  const member = useAuthStore((state) => state.member);

  const isNight = period === "night";
  const textColor = isNight ? NIGHT_TEXT : DAY_TEXT;
  const moodCircleColor = isNight ? MOOD_CIRCLE_NIGHT : MOOD_CIRCLE_DAY;
  const backgroundSource = isNight ? NIGHT_BG : DAY_BG;
  const mascotSource = isNight ? NIGHT_MASCOT : DAY_MASCOT;
  const heroHeight = Math.max(windowHeight * 0.48, 320);

  const displayName =
    member?.nickname?.trim() ||
    member?.memberId?.trim() ||
    t("home.friend");

  const greeting = getGreetingKey();

  const handleMoodPress = (mood: MoodId) => {
    router.push({
      pathname: "/journal/write",
      params: { mood },
    });
  };

  return (
    <View style={styles.root}>
      <Image
        source={backgroundSource}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={[styles.hero, { minHeight: heroHeight }]}>
            <View
              style={[
                styles.greetingBlock,
                { marginTop: Math.round(windowHeight * 0.14) },
              ]}
            >
              <Text style={[styles.greetingLine, { color: textColor }]}>
                {t(greeting.key)},
              </Text>
              <View style={styles.nameRow}>
                <Text style={[styles.name, { color: textColor }]}>
                  {displayName}
                </Text>
                <Text style={styles.emoji}>{greeting.emoji}</Text>
              </View>
            </View>

            <Image
              source={mascotSource}
              style={[
                styles.mascot,
                isNight ? styles.mascotNight : styles.mascotDay,
              ]}
              contentFit="contain"
              accessibilityLabel={
                isNight ? t("home.nightMascot") : t("home.dayMascot")
              }
            />
          </View>

          <View style={styles.content}>
            <Text style={[styles.howAreYouFeeling, { color: textColor }]}>
              {t("home.howAreYouFeeling")}
            </Text>

            <View style={styles.moodRow}>
              {MOODS.map((mood) => (
                <Pressable
                  key={mood.id}
                  accessibilityRole="button"
                  accessibilityLabel={t(mood.labelKey)}
                  onPress={() => handleMoodPress(mood.id)}
                  style={({ pressed }) => [
                    styles.moodItem,
                    pressed && styles.moodPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.moodCircle,
                      { backgroundColor: moodCircleColor },
                    ]}
                  >
                    <Image
                      source={mood.image}
                      style={styles.moodImage}
                      contentFit="contain"
                    />
                  </View>
                  <Text style={[styles.moodLabel, { color: textColor }]}>
                    {t(mood.labelKey)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <WeeklyMoodJourneyCard />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1a1838",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 12,
  },
  hero: {
    position: "relative",
    paddingHorizontal: 24,
    paddingTop: 8,
    overflow: "hidden",
  },
  greetingBlock: {
    zIndex: 2,
    maxWidth: "72%",
    paddingLeft: 4,
  },
  greetingLine: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  nameRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  name: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "400",
    letterSpacing: -0.3,
  },
  emoji: {
    fontSize: 20,
    lineHeight: 28,
  },
  mascot: {
    position: "absolute",
    zIndex: 1,
  },
  mascotNight: {
    right: -12,
    bottom: -8,
    width: 280,
    height: 280,
  },
  mascotDay: {
    right: -8,
    bottom: -4,
    width: 260,
    height: 260,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  howAreYouFeeling: {
    marginBottom: 18,
    textAlign: "left",
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
});

import { MOODS } from "@/constants/moods";
import type { MoodId } from "@/types/moodType";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";

const DAY_MASCOT = require("@/assets/mascotImages/Day.png");
const NIGHT_MASCOT = require("@/assets/mascotImages/night.png");

type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

type WeekDayEntry = {
  dayKey: WeekdayKey;
  moodId?: MoodId;
  placeholderImage?: ImageSourcePropType;
};

/** Temporary mock data until weekly mood API is connected. */
const MOCK_WEEK_ENTRIES: WeekDayEntry[] = [
  { dayKey: "mon", moodId: "Unhappy" },
  { dayKey: "tue", moodId: "Sad" },
  { dayKey: "wed", moodId: "Normal" },
  { dayKey: "thu", moodId: "Good" },
  { dayKey: "fri", moodId: "Happy" },
  { dayKey: "sat", placeholderImage: NIGHT_MASCOT },
  { dayKey: "sun", placeholderImage: DAY_MASCOT },
];

const MOOD_JOURNEY_THEME: Record<
  MoodId,
  { pill: string; text: string; dot: string }
> = {
  Unhappy: { pill: "#F3EEFF", text: "#8A6BE8", dot: "#8A6BE8" },
  Sad: { pill: "#EAF2FF", text: "#5B8DEF", dot: "#5B8DEF" },
  Normal: { pill: "#EEF1F8", text: "#7A82A8", dot: "#9AA3C7" },
  Good: { pill: "#EAF8F0", text: "#4FAF7A", dot: "#4FAF7A" },
  Happy: { pill: "#FFF6E5", text: "#E6A23B", dot: "#F0B429" },
};

const EMPTY_DAY_THEME = {
  pill: "#F4F5FA",
  text: "#B9BDD5",
  dot: "#D7DBEA",
};

function getMoodImage(moodId: MoodId) {
  return MOODS.find((mood) => mood.id === moodId)?.image;
}

function getMoodLabelKey(moodId: MoodId) {
  return MOODS.find((mood) => mood.id === moodId)?.labelKey;
}

export function WeeklyMoodJourneyCard() {
  const { t } = useTranslation();
  const router = useRouter();

  const checkedInDays = useMemo(
    () => MOCK_WEEK_ENTRIES.filter((entry) => entry.moodId).length,
    []
  );

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="calendar" size={18} color="#8A6BE8" />
            <Ionicons
              name="heart"
              size={10}
              color="#F08BB0"
              style={styles.headerHeart}
            />
          </View>
          <View>
            <Text style={styles.title}>{t("home.weeklyMood.title")}</Text>
            <Text style={styles.subtitle}>{t("home.weeklyMood.subtitle")}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("home.weeklyMood.viewCalendar")}
          onPress={() =>
            router.push({
              pathname: "/calendar-tab",
            })
          }
          style={({ pressed }) => [
            styles.viewCalendarButton,
            pressed && styles.viewCalendarPressed,
          ]}
        >
          <Text style={styles.viewCalendarText}>
            {t("home.weeklyMood.viewCalendar")}
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#8A6BE8" />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {MOCK_WEEK_ENTRIES.map((entry) => {
          const theme = entry.moodId
            ? MOOD_JOURNEY_THEME[entry.moodId]
            : EMPTY_DAY_THEME;
          const imageSource = entry.moodId
            ? getMoodImage(entry.moodId)
            : entry.placeholderImage;
          const labelKey = entry.moodId
            ? getMoodLabelKey(entry.moodId)
            : undefined;

          return (
            <View key={entry.dayKey} style={styles.dayColumn}>
              <Text style={styles.dayLabel}>
                {t(`home.weeklyMood.days.${entry.dayKey}`)}
              </Text>

              <View style={[styles.dayPill, { backgroundColor: theme.pill }]}>
                {imageSource ? (
                  <Image
                    source={imageSource}
                    style={styles.dayMoodImage}
                    contentFit="contain"
                  />
                ) : null}

                {labelKey ? (
                  <Text style={[styles.dayMoodLabel, { color: theme.text }]}>
                    {t(labelKey)}
                  </Text>
                ) : (
                  <Text style={styles.dayEmptyLabel}>—</Text>
                )}

                <View style={[styles.dayDot, { backgroundColor: theme.dot }]} />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.summaryBanner}>
        <View style={styles.summaryLeft}>
          <View style={styles.summaryIconWrap}>
            <Ionicons name="planet-outline" size={18} color="#8A6BE8" />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>
              {t("home.weeklyMood.checkedIn", { count: checkedInDays })}
            </Text>
            <Text style={styles.summaryCaption}>
              {t("home.weeklyMood.keepGoing")}
            </Text>
          </View>
        </View>

        <Image
          source={require("@/assets/mascotImages/happy.png")}
          style={styles.summaryMascot}
          contentFit="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F3EEFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerHeart: {
    position: "absolute",
    right: 5,
    bottom: 5,
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    color: "#2A2A6A",
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: "#8D93B8",
  },
  viewCalendarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F3EEFF",
  },
  viewCalendarPressed: {
    opacity: 0.86,
  },
  viewCalendarText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8A6BE8",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
    marginBottom: 14,
  },
  dayColumn: {
    flex: 1,
    alignItems: "center",
  },
  dayLabel: {
    marginBottom: 8,
    fontSize: 11,
    fontWeight: "500",
    color: "#9AA0C3",
  },
  dayPill: {
    width: "100%",
    minHeight: 108,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  dayMoodImage: {
    width: 34,
    height: 34,
  },
  dayMoodLabel: {
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  dayEmptyLabel: {
    fontSize: 12,
    lineHeight: 14,
    color: "#C4C9DE",
    fontWeight: "600",
  },
  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  summaryBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    backgroundColor: "#F3EEFF",
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 12,
    overflow: "hidden",
  },
  summaryLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCopy: {
    flex: 1,
    paddingRight: 8,
  },
  summaryTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#2A2A6A",
  },
  summaryCaption: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: "#8D93B8",
  },
  summaryMascot: {
    width: 54,
    height: 54,
    marginTop: 8,
  },
});

import {
  buildWeekDays,
  getMoodImage,
  getMoodLabelKey,
  getWeekDateRange,
  mapDiariesToWeeklyJournalMap,
  toIsoDate,
} from "@/components/home/weeklyMoodJourney.utils";
import { useEmotionDiariesByRange } from "@/features/calendar/hooks/useEmotionDiariesRange";
import type { WeekDayItem, WeeklyJournalPreview } from "@/types/weeklyJournalType";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { memo, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const CLOUD_MASCOT = require("@/assets/mascotImages/daymascot3d.png");

const SECTION_BG = "#fffaf7";
const CARD_BG = "#FFFFFF";
const GHOST_BTN_BG = "#F5F0FF";
const PRIMARY = "#8A6BE8";
const TEXT_PRIMARY = "#2A2A6A";
const TEXT_MUTED = "#6E6E8A";
const CHIP_SUN = "#FFF4E5";
const CHIP_MOON = "#EEF0FF";
const CHIP_HEART = "#FFEAF1";

type WeekDayButtonProps = {
  day: WeekDayItem;
  label: string;
  selected: boolean;
  onPress: () => void;
};

const WeekDayButton = memo(function WeekDayButton({
  day,
  label,
  selected,
  onPress,
}: WeekDayButtonProps) {
  const scale = useSharedValue(selected ? 1.04 : 1);

  useEffect(() => {
    scale.value = withSpring(selected ? 1.04 : 1, {
      damping: 14,
      stiffness: 220,
    });
  }, [scale, selected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.weekDayPressable}
    >
      <Animated.View
        style={[
          styles.weekDayCell,
          selected ? styles.weekDayCellSelected : styles.weekDayCellDefault,
          animatedStyle,
        ]}
      >
        <Text
          style={[
            styles.weekDayName,
            selected ? styles.weekDayNameSelected : styles.weekDayNameDefault,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.weekDayNumber,
            selected
              ? styles.weekDayNumberSelected
              : styles.weekDayNumberDefault,
          ]}
        >
          {day.dayNumber}
        </Text>
      </Animated.View>
    </Pressable>
  );
});

type JournalPreviewProps = {
  journal: WeeklyJournalPreview | null;
  formattedDate: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

const JournalPreviewCard = memo(function JournalPreviewCard({
  journal,
  formattedDate,
  isLoading,
  isError,
  onRetry,
}: JournalPreviewProps) {
  const { t } = useTranslation();

  const moodImage = journal?.moodId
    ? getMoodImage(journal.moodId)
    : CLOUD_MASCOT;
  const moodLabelKey = journal?.moodId
    ? getMoodLabelKey(journal.moodId)
    : undefined;
  const moodTitle =
    journal?.emotionName?.trim() ||
    (moodLabelKey ? t(moodLabelKey) : undefined);

  if (isLoading) {
    return (
      <View style={[styles.previewCard, styles.stateCard]}>
        <ActivityIndicator color={PRIMARY} />
        <Text style={styles.stateText}>{t("home.weeklyJournal.loading")}</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.previewCard, styles.stateCard]}>
        <Text style={styles.stateText}>{t("home.weeklyJournal.error")}</Text>
        {onRetry ? (
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.calendarButtonPressed,
            ]}
          >
            <Text style={styles.retryText}>{t("home.weeklyJournal.retry")}</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(280)}
      exiting={FadeOut.duration(200)}
      style={styles.previewCard}
    >
      <View style={styles.previewHeaderRow}>
        <Text style={styles.previewDate}>{formattedDate}</Text>
        {journal?.isToday ? (
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>
              {t("home.weeklyJournal.today")}
            </Text>
          </View>
        ) : null}
      </View>

      {journal?.moodId ? (
        <Animated.View
          entering={SlideInUp.duration(280).springify().damping(18)}
          style={styles.previewBody}
        >
          <Image
            source={moodImage ?? CLOUD_MASCOT}
            style={styles.previewMascot}
            contentFit="contain"
            accessible={false}
          />

          <View style={styles.previewCopy}>
            {moodTitle ? (
              <Text style={styles.previewMoodTitle} numberOfLines={1}>
                {moodTitle}
              </Text>
            ) : null}
            {journal.timeLabel ? (
              <View style={styles.timeRow}>
                <View style={styles.timeDot} />
                <Text style={styles.timeText}>{journal.timeLabel}</Text>
              </View>
            ) : null}
          </View>
        </Animated.View>
      ) : (
        <View style={styles.previewBody}>
          <Image
            source={CLOUD_MASCOT}
            style={styles.previewMascot}
            contentFit="contain"
            accessible={false}
          />
          <View style={styles.previewCopy}>
            <Text style={styles.emptyTitle}>
              {t("home.weeklyJournal.noEntry")}
            </Text>
          </View>
        </View>
      )}

      {journal?.moodId ? (
        <View style={styles.chipRow}>
          {journal.temperature ? (
            <View style={[styles.chip, { backgroundColor: CHIP_SUN }]}>
              <Text style={styles.chipText}>☀️ {journal.temperature}</Text>
            </View>
          ) : null}
          {journal.sleep ? (
            <View style={[styles.chip, { backgroundColor: CHIP_MOON }]}>
              <Text style={styles.chipText}>🌙 {journal.sleep}</Text>
            </View>
          ) : null}
          {journal.tag ? (
            <View style={[styles.chip, { backgroundColor: CHIP_HEART }]}>
              <Text style={styles.chipText} numberOfLines={1}>
                💗 {journal.tag}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {journal?.preview ? (
        <Text style={styles.previewText} numberOfLines={2}>
          {journal.preview}
        </Text>
      ) : null}

 
    </Animated.View>
  );
});

/** Home weekly mood journey — EMO-003 diaries for the current week. */
export function WeeklyMoodJourneyCard() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const todayIso = useMemo(() => toIsoDate(new Date()), []);

  const weekDays = useMemo(() => buildWeekDays(), []);
  const { fromDate, toDate } = useMemo(() => getWeekDateRange(), []);

  const diariesQuery = useEmotionDiariesByRange(fromDate, toDate);

  const journalMap = useMemo(
    () =>
      mapDiariesToWeeklyJournalMap(
        diariesQuery.data ?? [],
        weekDays,
        todayIso
      ),
    [diariesQuery.data, todayIso, weekDays]
  );

  const [selectedDate, setSelectedDate] = useState(() => todayIso);
  const selectedJournal = journalMap[selectedDate] ?? null;

  const locale = useMemo(() => {
    const language = (i18n.resolvedLanguage ?? i18n.language ?? "en")
      .toLowerCase()
      .split("-")[0];

    if (language === "mn") return "mn-MN";
    if (language === "ko") return "ko-KR";
    return "en-US";
  }, [i18n.language, i18n.resolvedLanguage]);

  const formattedDate = useMemo(() => {
    const date = new Date(`${selectedDate}T12:00:00`);
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
    }).format(date);
  }, [locale, selectedDate]);

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{t("home.weeklyMood.title")}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("home.weeklyMood.viewCalendar")}
          onPress={() =>
            router.push({
              pathname: "/calendar-tab",
            })
          }
          style={({ pressed }) => [
            styles.calendarButton,
            pressed && styles.calendarButtonPressed,
          ]}
        >
          <Ionicons name="chevron-forward" size={20} color={PRIMARY} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekRow}
      >
        {weekDays.map((day) => (
          <WeekDayButton
            key={day.date}
            day={day}
            label={t(`home.weeklyMood.days.${day.dayKey}`)}
            selected={day.date === selectedDate}
            onPress={() => setSelectedDate(day.date)}
          />
        ))}
      </ScrollView>

      <JournalPreviewCard
        key={selectedDate}
        journal={selectedJournal}
        formattedDate={formattedDate}
        isLoading={diariesQuery.isLoading}
        isError={diariesQuery.isError}
        onRetry={() => {
          void diariesQuery.refetch();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 28,
    backgroundColor: SECTION_BG,
    shadowColor: "#E8C9D4",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    flex: 1,
    color: TEXT_PRIMARY,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  calendarButton: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: GHOST_BTN_BG,
  },
  calendarButtonPressed: {
    opacity: 0.88,
  },
  weekRow: {
    gap: 8,
    paddingBottom: 16,
  },
  weekDayPressable: {
    width: 52,
  },
  weekDayCell: {
    width: 52,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  weekDayCellSelected: {
    backgroundColor: PRIMARY,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  weekDayCellDefault: {
    backgroundColor: "transparent",
  },
  weekDayName: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
  },
  weekDayNameSelected: {
    color: "#FFFFFF",
  },
  weekDayNameDefault: {
    color: TEXT_MUTED,
  },
  weekDayNumber: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "700",
  },
  weekDayNumberSelected: {
    color: "#FFFFFF",
  },
  weekDayNumberDefault: {
    color: TEXT_PRIMARY,
  },
  previewCard: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#D9C4CE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  stateCard: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  stateText: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: GHOST_BTN_BG,
  },
  retryText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "700",
  },
  previewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 16,
  },
  previewDate: {
    flex: 1,
    color: TEXT_PRIMARY,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },
  todayBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F0E9FF",
  },
  todayBadgeText: {
    color: PRIMARY,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  previewBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  previewMascot: {
    width: 72,
    height: 72,
  },
  previewCopy: {
    flex: 1,
    gap: 6,
  },
  previewMoodTitle: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F0B429",
  },
  timeText: {
    color: TEXT_MUTED,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  emptyTitle: {
    color: TEXT_MUTED,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: "100%",
  },
  chipText: {
    color: TEXT_PRIMARY,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  previewText: {
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
  heartFloating: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});

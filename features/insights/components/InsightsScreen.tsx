import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsTrigger,
  TabsTriggerText,
} from "@/components/ui/tabs";
import { JournalDetailScreen } from "@/features/calendar/components/JournalDetailScreen";
import { useJournalByDate } from "@/features/calendar/hooks/useJournalByDate";
import { MonthlyInsightCard } from "@/features/insights/components/MonthlyInsightCard";
import { WeeklyInsightCard } from "@/features/insights/components/WeeklyInsightCard";
import {
  INSIGHT_COLORS,
  PERIOD_OPTIONS,
} from "@/features/insights/constants/insights.constants";
import type { InsightPeriod } from "@/features/insights/types/insights.types";
import {
  mapMonthlyEmotionStatisticsToCard,
  mapWeeklyEmotionStatisticsToCard,
} from "@/features/insights/utils/mapWeeklyEmotionStatistics";
import { useMonthlyEmotionStatistics } from "@/hooks/insights/useMonthlyEmotionStatistics";
import { useWeeklyEmotionStatistics } from "@/hooks/insights/useWeeklyEmotionStatistics";
import { formatEmotionDate } from "@/utils/emotionDate";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function isInsightPeriod(value: string): value is InsightPeriod {
  return value === "day" || value === "week" || value === "month";
}

export function InsightsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [period, setPeriod] = useState<InsightPeriod>("week");
  const [trackWidth, setTrackWidth] = useState(0);
  const baseDate = useMemo(() => formatEmotionDate(), []);

  const isDay = period === "day";
  const isMonth = period === "month";
  const isWeek = period === "week";

  const weeklyQuery = useWeeklyEmotionStatistics({ baseDate }, isWeek);
  const monthlyQuery = useMonthlyEmotionStatistics({ baseDate }, isMonth);
  const dayDiaryQuery = useJournalByDate(baseDate);
  const activeQuery = isMonth ? monthlyQuery : weeklyQuery;
  const dayDiaryId =
    dayDiaryQuery.data?.exists && (dayDiaryQuery.data.diaryId ?? 0) > 0
      ? dayDiaryQuery.data.diaryId
      : undefined;

  const weeklyCardData = useMemo(() => {
    if (!isWeek || !weeklyQuery.data) {
      return null;
    }
    return mapWeeklyEmotionStatisticsToCard(weeklyQuery.data, t);
  }, [isWeek, weeklyQuery.data, t]);

  const monthlyCardData = useMemo(() => {
    if (!isMonth || !monthlyQuery.data) {
      return null;
    }
    return mapMonthlyEmotionStatisticsToCard(monthlyQuery.data, t);
  }, [isMonth, monthlyQuery.data, t]);

  const handlePeriodChange = (next: string) => {
    if (isInsightPeriod(next)) {
      setPeriod(next);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("insights.back")}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            }
          }}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color="#1D1D1F" />
        </Pressable>
        <Text style={styles.headerTitle}>{t("insights.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.periodWrap}>
        <Tabs
          value={period}
          onValueChange={handlePeriodChange}
          variant="filled"
        >
          <TabsList
            className="h-[48px] w-full overflow-hidden rounded-full bg-[#F2F2F4] p-[4px]"
            contentContainerStyle={styles.tabsRow}
            scrollEnabled={false}
            onLayout={(event: LayoutChangeEvent) => {
              setTrackWidth(event.nativeEvent.layout.width);
            }}
          >
            <TabsIndicator className="rounded-full bg-white" style={styles.tabIndicator} />
            {PERIOD_OPTIONS.map((option) => (
              <TabsTrigger
                key={option.key}
                value={option.key}
                className="z-10 items-center justify-center p-0"
                style={
                  trackWidth > 0
                    ? {
                        width: trackWidth / PERIOD_OPTIONS.length,
                        height: styles.tabIndicator.height,
                      }
                    : { height: styles.tabIndicator.height }
                }
              >
                <TabsTriggerText
                  className={`text-center text-[15px] font-semibold ${
                    period === option.key ? "text-[#1D1D1F]" : "text-[#9A9A9A]"
                  }`}
                >
                  {t(`insights.periods.${option.key}`)}
                </TabsTriggerText>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </View>

      {isDay ? (
        <View style={styles.dayWrap}>
          {dayDiaryQuery.isLoading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color={INSIGHT_COLORS.accent} />
              <Text style={styles.stateText}>{t("insights.daily.loading")}</Text>
            </View>
          ) : dayDiaryId == null ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>{t("insights.daily.noDiary")}</Text>
              <Text style={styles.stateHint}>{t("insights.daily.noDiaryHint")}</Text>
            </View>
          ) : (
            <JournalDetailScreen diaryId={dayDiaryId} embedded />
          )}
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.cardWrap}>
            {activeQuery.isLoading ? (
              <View style={styles.stateBox}>
                <ActivityIndicator color={INSIGHT_COLORS.accent} />
                <Text style={styles.stateText}>{t("insights.loading")}</Text>
              </View>
            ) : activeQuery.isError ? (
              <View style={styles.stateBox}>
                <Text style={styles.stateText}>{t("insights.error")}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    void activeQuery.refetch();
                  }}
                  style={({ pressed }) => [
                    styles.retryButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.retryText}>
                    {activeQuery.isFetching
                      ? t("insights.retrying")
                      : t("insights.retry")}
                  </Text>
                </Pressable>
              </View>
            ) : isMonth && monthlyCardData ? (
              <MonthlyInsightCard data={monthlyCardData} />
            ) : isWeek && weeklyCardData ? (
              <WeeklyInsightCard data={weeklyCardData} />
            ) : null}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: INSIGHT_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#1D1D1F",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  periodWrap: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
  },

  dayWrap: {
    flex: 1,
    marginTop: 8,
  },
  cardWrap: {
    marginTop: 16,
  },
  stateBox: {
    minHeight: 220,
    borderRadius: 28,
    backgroundColor: INSIGHT_COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  stateText: {
    fontSize: 14,
    fontWeight: "600",
    color: INSIGHT_COLORS.muted,
    textAlign: "center",
  },
  stateHint: {
    fontSize: 12,
    color: INSIGHT_COLORS.muted,
    textAlign: "center",
    lineHeight: 18,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: INSIGHT_COLORS.accentSoft,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "700",
    color: INSIGHT_COLORS.accent,
  },
  tabsRow: {
    flexGrow: 1,
    alignItems: "stretch",
    justifyContent: "center",
  },
  tabIndicator: {
    height: 40,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});

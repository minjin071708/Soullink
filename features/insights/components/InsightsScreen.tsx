import { MonthlyInsightCard } from "@/features/insights/components/MonthlyInsightCard";
import { PeriodSegment } from "@/features/insights/components/PeriodSegment";
import { WeeklyInsightCard } from "@/features/insights/components/WeeklyInsightCard";
import { INSIGHT_COLORS } from "@/features/insights/constants/insights.constants";
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
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function InsightsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [period, setPeriod] = useState<InsightPeriod>("week");
  const baseDate = useMemo(() => formatEmotionDate(), []);

  const isDay = period === "day";
  const isMonth = period === "month";
  const isWeek = period === "week";

  const weeklyQuery = useWeeklyEmotionStatistics({ baseDate }, isWeek);
  const monthlyQuery = useMonthlyEmotionStatistics({ baseDate }, isMonth);
  const activeQuery = isMonth ? monthlyQuery : weeklyQuery;

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
          <Ionicons name="chevron-back" size={22} color={INSIGHT_COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle}>{t("insights.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <PeriodSegment value={period} onChange={setPeriod} />

        <View style={styles.cardWrap}>
          {isDay ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>
                {t("insights.day.unavailable")}
              </Text>
              <Text style={styles.stateHint}>{t("insights.day.hint")}</Text>
            </View>
          ) : activeQuery.isLoading ? (
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
            <MonthlyInsightCard
              data={monthlyCardData}
              stats={
                monthlyQuery.data
                  ? {
                      recordedDays: monthlyQuery.data.recordedDays,
                      recordedRate: monthlyQuery.data.recordedRate,
                      weeklyAverages: monthlyQuery.data.weeklyAverages,
                    }
                  : null
              }
            />
          ) : isWeek && weeklyCardData ? (
            <WeeklyInsightCard data={weeklyCardData} />
          ) : null}
        </View>
      </ScrollView>
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
    fontSize: 18,
    fontWeight: "800",
    color: INSIGHT_COLORS.title,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
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
});

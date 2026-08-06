import { MOCK_WEEKLY_INSIGHT } from "@/features/insights/api/insightsMock";
import {
  AiObservationSection,
  PreviousReportsSection,
} from "@/features/insights/components/InsightSections";
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
import type { EmotionTopTag } from "@/types/emotionStatisticsType";
import { formatEmotionDate } from "@/utils/emotionDate";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function mapTopTagsToObservations(topTags: EmotionTopTag[]) {
  return topTags.slice(0, 2).map((tag, index) => ({
    id: String(tag.tagId),
    title: index === 0 ? "Давтагдсан мэдрэмж" : "Түгээмэл tag",
    subtitle: `${tag.tagName} · ${tag.count}`,
    icon: (index === 0 ? "recurring" : "helpful") as "recurring" | "helpful",
    accent: index === 0 ? INSIGHT_COLORS.happy : INSIGHT_COLORS.sad,
  }));
}

export function InsightsScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<InsightPeriod>("week");
  const baseDate = useMemo(() => formatEmotionDate(), []);

  const isMonth = period === "month";
  // "day" has no dedicated stats endpoint yet — reuse weekly.
  const isWeeklyScope = !isMonth;

  const weeklyQuery = useWeeklyEmotionStatistics(
    { baseDate },
    isWeeklyScope
  );
  const monthlyQuery = useMonthlyEmotionStatistics({ baseDate }, isMonth);

  const activeQuery = isMonth ? monthlyQuery : weeklyQuery;

  const cardData = useMemo(() => {
    if (isMonth) {
      return monthlyQuery.data
        ? mapMonthlyEmotionStatisticsToCard(monthlyQuery.data)
        : null;
    }

    return weeklyQuery.data
      ? mapWeeklyEmotionStatisticsToCard(weeklyQuery.data)
      : null;
  }, [isMonth, monthlyQuery.data, weeklyQuery.data]);

  const observationItems = useMemo(() => {
    const topTags = isMonth
      ? monthlyQuery.data?.topTags
      : weeklyQuery.data?.topTags;

    if (!topTags?.length) {
      return MOCK_WEEKLY_INSIGHT.observations;
    }

    return mapTopTagsToObservations(topTags);
  }, [isMonth, monthlyQuery.data?.topTags, weeklyQuery.data?.topTags]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Буцах"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            }
          }}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={INSIGHT_COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle}>AI Insight</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <PeriodSegment value={period} onChange={setPeriod} />

        <View style={styles.cardWrap}>
          {activeQuery.isLoading ? (
            <View style={styles.stateBox}>
              <ActivityIndicator color={INSIGHT_COLORS.accent} />
              <Text style={styles.stateText}>Тайлан ачаалж байна...</Text>
            </View>
          ) : activeQuery.isError ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>Тайлан ачаалж чадсангүй</Text>
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
                  {activeQuery.isFetching ? "Ачаалж байна..." : "Дахин оролдох"}
                </Text>
              </Pressable>
            </View>
          ) : cardData ? (
            <WeeklyInsightCard data={cardData} />
          ) : null}
        </View>

        <AiObservationSection
          observation={MOCK_WEEKLY_INSIGHT.aiObservation}
          items={observationItems}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Дэлгэрэнгүй тайлан"
          style={({ pressed }) => [
            styles.detailButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="stats-chart" size={18} color="#FFFFFF" />
          <Text style={styles.detailButtonText}>Дэлгэрэнгүй тайлан</Text>
        </Pressable>

        <PreviousReportsSection reports={MOCK_WEEKLY_INSIGHT.previousReports} />
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
  detailButton: {
    marginTop: 20,
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: INSIGHT_COLORS.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  detailButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

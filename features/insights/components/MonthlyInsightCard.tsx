import { EmotionDonutChart } from "@/features/insights/components/EmotionDonutChart";
import { INSIGHT_COLORS } from "@/features/insights/constants/insights.constants";
import type { WeeklyInsightMock } from "@/features/insights/types/insights.types";
import type { MonthlyEmotionStatisticsData } from "@/types/emotionStatisticsType";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

const INSIGHT_MASCOT = require("@/assets/mascotImages/insightMascot.png");

type MonthlyInsightCardProps = {
  data: Pick<
    WeeklyInsightMock,
    | "periodLabel"
    | "dateRangeLabel"
    | "headline"
    | "totalDays"
    | "journalCount"
    | "dominantEmotion"
    | "emotionShares"
  >;
  stats?: Pick<
    MonthlyEmotionStatisticsData,
    | "recordedDays"
    | "recordRate"
    | "averageScore"
    | "scoreChange"
    | "bestDay"
    | "lowestDay"
  > | null;
};

export function MonthlyInsightCard({ data, stats }: MonthlyInsightCardProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Image
          source={INSIGHT_MASCOT}
          style={styles.mascot}
          contentFit="contain"
          accessibilityLabel="AI Insight mascot"
        />

        <View style={styles.headerCopy}>
          <View style={styles.periodRow}>
            <Ionicons name="calendar" size={14} color={INSIGHT_COLORS.accent} />
            <Text style={styles.periodLabel}>{data.periodLabel}</Text>
          </View>
          <Text style={styles.dateRange}>{data.dateRangeLabel}</Text>
        </View>
      </View>

      <Text style={styles.headline}>{data.headline}</Text>

      {stats ? (
        <View style={styles.metricRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricTitle}>
              {t("insights.monthly.recordRate")}
            </Text>
            <Text style={styles.metricValue}>
              {Math.round(stats.recordRate)}%
            </Text>
            <Text style={styles.metricHint}>
              {t("insights.monthly.daysCount", {
                count: stats.recordedDays,
              })}
            </Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricTitle}>
              {t("insights.monthly.averageScore")}
            </Text>
            <Text style={styles.metricValue}>
              {stats.averageScore != null ? stats.averageScore.toFixed(1) : "—"}
            </Text>
            {stats.scoreChange != null ? (
              <Text style={styles.metricHint}>
                {t("insights.monthly.scoreChange", {
                  value: `${stats.scoreChange > 0 ? "+" : ""}${stats.scoreChange.toFixed(1)}`,
                })}
              </Text>
            ) : (
              <Text style={styles.metricHint}>
                {t("insights.monthly.scoreMissing")}
              </Text>
            )}
          </View>
        </View>
      ) : null}

      <View style={styles.chartSection}>
        <EmotionDonutChart
          shares={data.emotionShares}
          totalDays={data.totalDays}
        />
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Ionicons name="leaf" size={20} color={data.dominantEmotion.color} />
          <View style={styles.summaryCopy}>
            <Text
              style={[
                styles.summaryTitle,
                { color: data.dominantEmotion.color },
              ]}
            >
              {data.dominantEmotion.label}
            </Text>
            <Text style={styles.summaryValue}>
              {data.dominantEmotion.daysLabel}
            </Text>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <Ionicons
            name="document-text-outline"
            size={20}
            color={INSIGHT_COLORS.sad}
          />
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryValue}>{data.journalCount}</Text>
            <Text style={styles.summaryCaption}>
              {t("insights.monthly.journalCaption")}
            </Text>
          </View>
        </View>
      </View>

      {stats?.bestDay || stats?.lowestDay ? (
        <View style={styles.dayRow}>
          {stats.bestDay ? (
            <View style={styles.dayBox}>
              <Ionicons
                name="sunny-outline"
                size={16}
                color={INSIGHT_COLORS.happy}
              />
              <View style={styles.dayCopy}>
                <Text style={styles.dayTitle}>
                  {t("insights.monthly.bestDay")}
                </Text>
                <Text style={styles.dayValue}>
                  {stats.bestDay.date} · {stats.bestDay.score}
                </Text>
              </View>
            </View>
          ) : null}
          {stats.lowestDay ? (
            <View style={styles.dayBox}>
              <Ionicons
                name="rainy-outline"
                size={16}
                color={INSIGHT_COLORS.sad}
              />
              <View style={styles.dayCopy}>
                <Text style={styles.dayTitle}>
                  {t("insights.monthly.lowestDay")}
                </Text>
                <Text style={styles.dayValue}>
                  {stats.lowestDay.date} · {stats.lowestDay.score}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: INSIGHT_COLORS.card,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    shadowColor: "#2A2A4A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },
  mascot: {
    width: 108,
    height: 100,
    marginLeft: -4,
    marginTop: -4,
  },
  headerCopy: {
    flex: 1,
    alignItems: "flex-end",
    paddingTop: 8,
  },
  periodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  periodLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: INSIGHT_COLORS.accent,
  },
  dateRange: {
    fontSize: 13,
    color: INSIGHT_COLORS.muted,
  },
  headline: {
    fontSize: 23,
    lineHeight: 31,
    fontWeight: "800",
    color: INSIGHT_COLORS.title,
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  metricBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: INSIGHT_COLORS.border,
    borderRadius: 14,
    padding: 10,
    backgroundColor: "#FCFBFD",
  },
  metricTitle: {
    fontSize: 12,
    color: INSIGHT_COLORS.muted,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "800",
    color: INSIGHT_COLORS.title,
  },
  metricHint: {
    marginTop: 2,
    fontSize: 11,
    color: INSIGHT_COLORS.muted,
  },
  chartSection: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryBox: {
    flex: 1,
    minHeight: 68,
    borderWidth: 1,
    borderColor: INSIGHT_COLORS.border,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FCFBFD",
  },
  summaryCopy: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "800",
    color: INSIGHT_COLORS.title,
  },
  summaryCaption: {
    marginTop: 1,
    fontSize: 12,
    fontWeight: "600",
    color: INSIGHT_COLORS.muted,
  },
  dayRow: {
    marginTop: 12,
    gap: 8,
  },
  dayBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: INSIGHT_COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FCFBFD",
  },
  dayCopy: {
    flex: 1,
  },
  dayTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: INSIGHT_COLORS.muted,
  },
  dayValue: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "700",
    color: INSIGHT_COLORS.title,
  },
});

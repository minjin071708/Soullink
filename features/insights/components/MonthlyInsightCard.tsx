import { EmotionDonutChart } from "@/features/insights/components/EmotionDonutChart";
import {
  AiObservationSection,
  PreviousReportsSection,
} from "@/features/insights/components/InsightSections";
import { EMOTION_CHART_COLORS, INSIGHT_COLORS } from "@/features/insights/constants/insights.constants";
import type { WeeklyInsightCardModel } from "@/features/insights/types/insights.types";
import type {
  MonthlyStatisticsData,
  WeeklyAverage,
} from "@/types/emotionStatisticsType";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

const INSIGHT_MASCOT = require("@/assets/mascotImages/insightMascot.png");

type MonthlyInsightCardProps = {
  data: WeeklyInsightCardModel;
  stats?: Pick<
    MonthlyStatisticsData,
    "recordedDays" | "recordedRate" | "weeklyAverages"
  > | null;
};

function weekEmotionColor(code: string | undefined): string {
  if (!code) {
    return EMOTION_CHART_COLORS.NEUTRAL;
  }
  const upper = code.trim().toUpperCase();
  if (upper in EMOTION_CHART_COLORS) {
    return EMOTION_CHART_COLORS[
      upper as keyof typeof EMOTION_CHART_COLORS
    ];
  }
  return EMOTION_CHART_COLORS.NEUTRAL;
}

function formatWeekLabel(week: WeeklyAverage): string {
  const start = week.weekStartDate.slice(5).replace("-", "/");
  const end = week.weekEndDate.slice(5).replace("-", "/");
  return `${start}–${end}`;
}

export function MonthlyInsightCard({ data, stats }: MonthlyInsightCardProps) {
  const { t } = useTranslation();

  return (
    <View>
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
              <Ionicons
                name="calendar"
                size={14}
                color={INSIGHT_COLORS.accent}
              />
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
                {t("insights.monthly.recordedDays")}
              </Text>
              <Text style={styles.metricValue}>{stats.recordedDays}</Text>
              <Text style={styles.metricHint}>
                {t("insights.monthly.daysCount", {
                  count: stats.recordedDays,
                })}
              </Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricTitle}>
                {t("insights.monthly.recordedRate")}
              </Text>
              <Text style={styles.metricValue}>
                {Math.round(stats.recordedRate)}%
              </Text>
              <Text style={styles.metricHint}>
                {t("insights.monthly.recordRateLabel", {
                  rate: Math.round(stats.recordedRate),
                })}
              </Text>
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

        {stats?.weeklyAverages?.length ? (
          <View style={styles.weekSection}>
            <Text style={styles.weekSectionTitle}>
              {t("insights.monthly.weeklyAverages")}
            </Text>
            {stats.weeklyAverages.map((week) => {
              const color = weekEmotionColor(week.dominantEmotionCode);
              return (
                <View
                  key={`${week.weekStartDate}-${week.weekEndDate}`}
                  style={styles.weekRow}
                >
                  <View style={[styles.weekDot, { backgroundColor: color }]} />
                  <Text style={styles.weekLabel}>{formatWeekLabel(week)}</Text>
                  <Text style={[styles.weekScore, { color }]}>
                    {week.averageScore != null
                      ? week.averageScore.toFixed(1)
                      : "—"}
                  </Text>
                  <Text style={styles.weekEmotion}>
                    {week.dominantEmotionCode?.trim() || "—"}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}
      </View>

      <AiObservationSection
        observation={data.aiObservation}
        items={data.observations}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("insights.detailReport")}
        style={({ pressed }) => [styles.detailButton, pressed && styles.pressed]}
      >
        <Ionicons name="stats-chart" size={18} color="#FFFFFF" />
        <Text style={styles.detailButtonText}>{t("insights.detailReport")}</Text>
      </Pressable>

      {data.previousReports.length > 0 ? (
        <PreviousReportsSection reports={data.previousReports} />
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
  weekSection: {
    marginTop: 14,
    gap: 8,
  },
  weekSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: INSIGHT_COLORS.title,
    marginBottom: 2,
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: INSIGHT_COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FCFBFD",
  },
  weekDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  weekLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: INSIGHT_COLORS.title,
  },
  weekScore: {
    fontSize: 14,
    fontWeight: "800",
  },
  weekEmotion: {
    fontSize: 12,
    fontWeight: "600",
    color: INSIGHT_COLORS.muted,
    maxWidth: 72,
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
  pressed: {
    opacity: 0.85,
  },
});

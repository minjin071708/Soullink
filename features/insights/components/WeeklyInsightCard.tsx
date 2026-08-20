import { EmotionDonutChart } from "@/features/insights/components/EmotionDonutChart";
import { PreviousReportsSection } from "@/features/insights/components/InsightSections";
import { INSIGHT_COLORS } from "@/features/insights/constants/insights.constants";
import type { WeeklyInsightCardModel } from "@/features/insights/types/insights.types";
import { mapWeeklyEmotionStatisticsToCard } from "@/features/insights/utils/mapWeeklyEmotionStatistics";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

type WeeklyInsightCardProps = {
  data: WeeklyInsightCardModel;
  metaKey?: "insights.weekly.metaLine" | "insights.monthly.metaLine";
};

export function WeeklyInsightCard({
  data,
  metaKey = "insights.weekly.metaLine",
}: WeeklyInsightCardProps) {
  const { t } = useTranslation();
  const [selectedData, setSelectedData] =
    useState<WeeklyInsightCardModel | null>(null);

  useEffect(() => {
    setSelectedData(null);
  }, [data]);

  const displayed = selectedData ?? data;

  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.meta}>
          {t(metaKey, {
            dateRange: displayed.dateRangeLabel,
            count: displayed.recordedDays,
          })}
        </Text>
        <Text style={styles.headline}>{displayed.headline}</Text>

        <View style={styles.chartSection}>
          <EmotionDonutChart
            shares={displayed.emotionShares}
            totalDays={displayed.totalDays}
          />
        </View>

        <View style={styles.observationBox}>
          <View style={styles.observationTitleRow}>
            <Ionicons name="sparkles" size={15} color="#7388F2" />
            <Text style={styles.observationTitle}>
              {t("insights.aiObservation")}
            </Text>
          </View>
          <Text style={styles.observationBody}>{displayed.aiObservation}</Text>
        </View>
      </View>

      {data.previousReports.length > 0 ? (
        <PreviousReportsSection
          reports={data.previousReports}
          onPressReport={(_report, detail) => {
            setSelectedData(mapWeeklyEmotionStatisticsToCard(detail, t));
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: INSIGHT_COLORS.card,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    shadowColor: "#1D1D1F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  meta: {
    fontSize: 13,
    fontWeight: "500",
    color: "#9A9AA8",
    marginBottom: 10,
  },
  headline: {
    fontSize: 21,
    lineHeight: 32,
    fontWeight: "800",
    color: "#1D1D1F",
    letterSpacing: -0.5,
    marginBottom: 18,
  },
  chartSection: {
    marginBottom: 18,
  },
  observationBox: {
    backgroundColor: "#F0F5FF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  observationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  observationTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7388F2",
  },
  observationBody: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "400",
    color: "#3A3A45",
  },
});

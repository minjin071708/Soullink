import { EmotionDonutChart } from "@/features/insights/components/EmotionDonutChart";
import { INSIGHT_COLORS } from "@/features/insights/constants/insights.constants";
import type { WeeklyInsightMock } from "@/features/insights/types/insights.types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

const INSIGHT_MASCOT = require("@/assets/mascotImages/insightMascot.png");

type WeeklyInsightCardProps = {
  data: WeeklyInsightMock;
};

export function WeeklyInsightCard({ data }: WeeklyInsightCardProps) {
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
            <Text style={styles.summaryCaption}>тэмдэглэл</Text>
          </View>
        </View>
      </View>
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
    marginBottom: 18,
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
});

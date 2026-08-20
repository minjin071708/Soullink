import { INSIGHT_COLORS } from "@/features/insights/constants/insights.constants";
import type { InsightEmotionShare } from "@/features/insights/types/insights.types";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts/dist/PieChart";

type EmotionDonutChartProps = {
  shares: InsightEmotionShare[];
  totalDays: number;
};

export function EmotionDonutChart({
  shares,
  totalDays,
}: EmotionDonutChartProps) {
  const { t } = useTranslation();
  const chartData = useMemo(() => {
    const active = shares.filter((item) => item.count > 0);

    if (active.length === 0) {
      return [
        {
          value: 1,
          color: INSIGHT_COLORS.neutral,
          stroke: "#FFFFFF",
          strokeWidth: 4,
          focused: true,
        },
      ];
    }

    return active.map((item) => ({
      value: item.count,
      color: item.color,
      stroke: "#FFFFFF",
      strokeWidth: 4,
    }));
  }, [shares]);

  return (
    <View style={styles.row}>
      <View style={styles.chartWrap}>
        <PieChart
          data={chartData}
          donut
          radius={74}
          innerRadius={48}
          isAnimated
          animationDuration={900}
          strokeColor="#FFFFFF"
          strokeWidth={4}
          innerCircleColor={INSIGHT_COLORS.card}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerValue}>
                {t("insights.chart.days", { count: totalDays })}
              </Text>
            </View>
          )}
        />
      </View>

      <View style={styles.legend}>
        {shares
          .filter((item) => item.count > 0)
          .map((item) => (
          <View key={item.key} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {item.label}
            </Text>
            <Text style={styles.legendCount}>{item.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  chartWrap: {
    width: 156,
    height: 156,
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerValue: {
    fontSize: 18,
    fontWeight: "800",
    color: INSIGHT_COLORS.title,
    lineHeight: 22,
    textAlign: "center",
  },
  centerUnit: {
    fontSize: 13,
    fontWeight: "600",
    color: INSIGHT_COLORS.muted,
  },
  legend: {
    flex: 1,
    gap: 14,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    color: "#6B6B78",
  },
  legendCount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1D1D1F",
    minWidth: 16,
    textAlign: "right",
  },
});

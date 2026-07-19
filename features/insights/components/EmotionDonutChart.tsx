import { INSIGHT_COLORS } from "@/features/insights/constants/insights.constants";
import type { InsightEmotionShare } from "@/features/insights/types/insights.types";
import { useMemo } from "react";
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
  const chartData = useMemo(() => {
    const active = shares.filter((item) => item.count > 0);

    if (active.length === 0) {
      return [
        {
          value: 1,
          color: INSIGHT_COLORS.neutral,
          stroke: "#FFFFFF",
          strokeWidth: 3,
          focused: true,
        },
      ];
    }

    return active.map((item, index) => ({
      value: item.count,
      color: item.color,
      stroke: "#FFFFFF",
      strokeWidth: 3,
      focused: index === 0,
    }));
  }, [shares]);

  return (
    <View style={styles.row}>
      <View style={styles.chartWrap}>
        <PieChart
          data={chartData}
          donut
          radius={78}
          innerRadius={52}
          isAnimated
          animationDuration={900}
          focusOnPress
          sectionAutoFocus
          strokeColor="#FFFFFF"
          strokeWidth={3}
          innerCircleColor={INSIGHT_COLORS.card}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <Text style={styles.centerValue}>{totalDays} өдөр</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.legend}>
        {shares.map((item) => (
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
    width: 168,
    height: 168,
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
    gap: 10,
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
    fontSize: 13,
    color: INSIGHT_COLORS.title,
  },
  legendCount: {
    fontSize: 13,
    fontWeight: "700",
    color: INSIGHT_COLORS.title,
    minWidth: 16,
    textAlign: "right",
  },
});

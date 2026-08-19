import {
  INSIGHT_COLORS,
  PERIOD_OPTIONS,
} from "@/features/insights/constants/insights.constants";
import type { InsightPeriod } from "@/features/insights/types/insights.types";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

type PeriodSegmentProps = {
  value: InsightPeriod;
  onChange: (period: InsightPeriod) => void;
};

export function PeriodSegment({ value, onChange }: PeriodSegmentProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.track}>
      {PERIOD_OPTIONS.map((option) => {
        const selected = option.key === value;

        return (
          <Pressable
            key={option.key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.key)}
            style={[styles.item, selected && styles.itemSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {t(`insights.periods.${option.key}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    backgroundColor: INSIGHT_COLORS.segmentTrack,
    borderRadius: 999,
    padding: 4,
  },
  item: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  itemSelected: {
    backgroundColor: INSIGHT_COLORS.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: INSIGHT_COLORS.muted,
  },
  labelSelected: {
    color: "#FFFFFF",
  },
});

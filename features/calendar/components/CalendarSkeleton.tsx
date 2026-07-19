import { CALENDAR_COLORS } from "@/features/calendar/constants/calendar.constants";
import { StyleSheet, View } from "react-native";

type CalendarSkeletonProps = {
  variant?: "month" | "journals";
};

export function CalendarSkeleton({ variant = "month" }: CalendarSkeletonProps) {
  if (variant === "journals") {
    return (
      <View style={styles.journalWrap}>
        <View style={styles.journalLine} />
        <View style={styles.journalCard} />
      </View>
    );
  }

  return (
    <View style={styles.monthCard}>
      <View style={styles.weekRow}>
        {Array.from({ length: 7 }).map((_, index) => (
          <View key={`week-${index}`} style={styles.weekDot} />
        ))}
      </View>
      <View style={styles.grid}>
        {Array.from({ length: 35 }).map((_, index) => (
          <View key={`cell-${index}`} style={styles.cell} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  monthCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: CALENDAR_COLORS.card,
    padding: 14,
    minHeight: 320,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  weekDot: {
    width: 24,
    height: 10,
    borderRadius: 6,
    backgroundColor: "#ECEAF8",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cell: {
    width: "12%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#F3F1FA",
  },
  journalWrap: {
    marginHorizontal: 16,
    marginTop: 18,
    gap: 12,
  },
  journalLine: {
    width: "55%",
    height: 18,
    borderRadius: 8,
    backgroundColor: "#E8E5F5",
  },
  journalCard: {
    height: 96,
    borderRadius: 20,
    backgroundColor: CALENDAR_COLORS.card,
  },
});

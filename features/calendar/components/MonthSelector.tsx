import { CALENDAR_COLORS } from "@/features/calendar/constants/calendar.constants";
import { formatMonthTitleMn } from "@/features/calendar/utils/calendar.utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type MonthSelectorProps = {
  year: number;
  month: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
};

export function MonthSelector({
  year,
  month,
  onPreviousMonth,
  onNextMonth,
}: MonthSelectorProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Өмнөх сар"
        onPress={onPreviousMonth}
        style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}
      >
        <Ionicons name="chevron-back" size={20} color={CALENDAR_COLORS.primary} />
      </Pressable>

      <Text style={styles.title}>{formatMonthTitleMn(year, month)}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Дараагийн сар"
        onPress={onNextMonth}
        style={({ pressed }) => [styles.arrowButton, pressed && styles.pressed]}
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          color={CALENDAR_COLORS.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: CALENDAR_COLORS.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.75,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: CALENDAR_COLORS.title,
  },
});

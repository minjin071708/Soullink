import { CalendarDay } from "@/features/calendar/components/CalendarDay";
import {
  CALENDAR_COLORS,
  WEEKDAY_LABELS,
} from "@/features/calendar/constants/calendar.constants";
import type { CalendarMood } from "@/features/calendar/types/calendar.types";
import {
  buildMonthGrid,
  getTodayDateString,
  toMoodMap,
} from "@/features/calendar/utils/calendar.utils";
import type { EmotionDiariesListItem } from "@/types/journalType";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type MoodCalendarProps = {
  year: number;
  month: number;
  days: CalendarMood[];
  selectedDate: string;
  diariesByDate: Record<string, EmotionDiariesListItem>;
  onSelectDate: (date: string) => void;
};

export function MoodCalendar({
  year,
  month,
  days,
  selectedDate,
  diariesByDate,
  onSelectDate,
}: MoodCalendarProps) {
  const today = getTodayDateString();

  const cells = useMemo(() => {
    return buildMonthGrid({
      year,
      month,
      moodByDate: toMoodMap(days),
      today,
    });
  }, [year, month, days, today]);

  return (
    <View style={styles.card}>
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((label) => (
          <Text key={label} style={styles.weekLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => (
          <CalendarDay
            key={cell.key}
            cell={cell}
            selected={cell.date === selectedDate}
            diary={cell.date ? diariesByDate[cell.date] : undefined}
            onSelect={onSelectDate}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: CALENDAR_COLORS.card,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 10,
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekLabel: {
    width: "14.28%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: CALENDAR_COLORS.weekLabel,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

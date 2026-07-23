import { MOOD_IMAGES } from "@/constants/moods";
import {
  CALENDAR_COLORS,
  MOOD_CONFIG,
} from "@/features/calendar/constants/calendar.constants";
import type { CalendarDayCell } from "@/features/calendar/types/calendar.types";
import type { EmotionCode } from "@/types/emotionType";
import type { EmotionDiariesListItem } from "@/types/journalType";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

type CalendarDayProps = {
  cell: CalendarDayCell;
  selected: boolean;
  diary?: EmotionDiariesListItem;
  onSelect: (date: string) => void;
};

function isEmotionCode(value: string): value is EmotionCode {
  return value in MOOD_IMAGES;
}

export function CalendarDay({
  cell,
  selected,
  diary,
  onSelect,
}: CalendarDayProps) {
  if (!cell.isCurrentMonth || !cell.date || cell.dayNumber === null) {
    return <View style={styles.cell} />;
  }

  const disabled = cell.isFuture;
  const emotionCode = diary?.emotionCode?.toUpperCase() ?? "";
  const moodImage =
    emotionCode && isEmotionCode(emotionCode)
      ? MOOD_IMAGES[emotionCode]
      : undefined;
  const moodColor = cell.mood ? MOOD_CONFIG[cell.mood].color : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={`${cell.dayNumber} өдөр`}
      disabled={disabled}
      onPress={() => onSelect(cell.date as string)}
      style={({ pressed }) => [
        styles.cell,
        selected && styles.selectedCell,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.dayNumber,
          disabled && styles.disabledText,
          selected && styles.selectedText,
        ]}
      >
        {cell.dayNumber}
      </Text>

      {moodImage ? (
        <Image
          source={moodImage}
          style={styles.moodImage}
          contentFit="contain"
        />
      ) : moodColor ? (
        <View style={[styles.dot, { backgroundColor: moodColor }]} />
      ) : (
        <View style={styles.placeholder} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: "14.28%",
    aspectRatio: 0.78,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 6,
    borderRadius: 14,
  },
  selectedCell: {
    backgroundColor: CALENDAR_COLORS.selectedFill,
    borderWidth: 1.5,
    borderColor: CALENDAR_COLORS.selectedBorder,
  },
  pressed: {
    opacity: 0.85,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: CALENDAR_COLORS.title,
    marginBottom: 2,
  },
  selectedText: {
    color: CALENDAR_COLORS.primary,
  },
  disabledText: {
    color: CALENDAR_COLORS.disabledText,
  },
  moodImage: {
    width: 26,
    height: 26,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 8,
  },
  placeholder: {
    height: 26,
  },
});

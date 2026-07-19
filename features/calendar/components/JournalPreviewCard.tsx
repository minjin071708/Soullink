import {
  CALENDAR_COLORS,
  MOOD_CONFIG,
} from "@/features/calendar/constants/calendar.constants";
import type { CalendarJournalPreview } from "@/features/calendar/types/calendar.types";
import { formatCreatedTime } from "@/features/calendar/utils/calendar.utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

type JournalPreviewCardProps = {
  item: CalendarJournalPreview;
  onPress: () => void;
  onPressAiAnalysis?: () => void;
};

export function JournalPreviewCard({
  item,
  onPress,
  onPressAiAnalysis,
}: JournalPreviewCardProps) {
  const mood = MOOD_CONFIG[item.mood];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Тэмдэглэл харах"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.thumb}>
        <Image source={mood.image} style={styles.moodImage} contentFit="contain" />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.meta}>
            <Text style={[styles.moodLabel, { color: mood.color }]}>
              {mood.label}
            </Text>
            <Text style={styles.time}>{formatCreatedTime(item.createdAt)}</Text>
          </View>

          {item.hasAiAnalysis ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="AI анализ харах"
              hitSlop={8}
              onPress={() => {
                onPressAiAnalysis?.();
              }}
              style={({ pressed }) => [
                styles.aiBadge,
                pressed && styles.aiBadgePressed,
              ]}
            >
              <Ionicons name="sparkles" size={12} color={CALENDAR_COLORS.primary} />
              <Text style={styles.aiText}>AI анализ</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.preview} numberOfLines={2}>
          {item.contentPreview}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: CALENDAR_COLORS.card,
    borderRadius: 20,
    padding: 14,
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.92,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: "#FFF6E8",
    alignItems: "center",
    justifyContent: "center",
  },
  moodImage: {
    width: 56,
    height: 56,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  meta: {
    flex: 1,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  time: {
    marginTop: 2,
    fontSize: 12,
    color: CALENDAR_COLORS.muted,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F3EEFF",
  },
  aiBadgePressed: {
    opacity: 0.8,
  },
  aiText: {
    fontSize: 11,
    fontWeight: "600",
    color: CALENDAR_COLORS.primary,
  },
  preview: {
    fontSize: 13,
    lineHeight: 19,
    color: CALENDAR_COLORS.title,
  },
});

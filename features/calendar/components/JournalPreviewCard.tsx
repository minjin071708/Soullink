import { MOOD_IMAGES } from "@/constants/moods";
import {
  CALENDAR_COLORS,
  MOOD_CONFIG,
} from "@/features/calendar/constants/calendar.constants";
import type { CalendarJournalPreview } from "@/features/calendar/types/calendar.types";
import { formatCreatedTime } from "@/features/calendar/utils/calendar.utils";
import type { EmotionCode } from "@/types/emotionType";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type JournalPreviewCardProps = {
  item: CalendarJournalPreview;
  onPress: () => void;
  onPressAiAnalysis?: () => void;
};

function isEmotionCode(value: string): value is EmotionCode {
  return value in MOOD_IMAGES;
}

export function JournalPreviewCard({
  item,
  onPress,
  onPressAiAnalysis,
}: JournalPreviewCardProps) {
  const router = useRouter();

  const mood = MOOD_CONFIG[item.mood];
  const emotionCode = item.emotionCode?.toUpperCase() ?? "";
  const moodImage =
    emotionCode && isEmotionCode(emotionCode)
      ? MOOD_IMAGES[emotionCode]
      : mood.image;
  const emotionLabel = item.emotionName?.trim() || emotionCode || mood.label;
  const previewText =
    item.aiAnalysisSummary?.trim() || item.contentPreview?.trim() || "";

  const handlePressEdit = () => {
    router.push({
      pathname: "/journal/write",
      params: {
        diaryId: String(item.diaryId),
        ...(isEmotionCode(emotionCode) ? { mood: emotionCode } : {}),
      },
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.mainRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Тэмдэглэл харах"
          onPress={onPress}
          style={({ pressed }) => [
            styles.mainPressable,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.thumb}>
            <Image
              source={moodImage}
              style={styles.moodImage}
              contentFit="contain"
            />
          </View>

          <View style={styles.content}>
            <View style={styles.meta}>
              <Text style={[styles.moodLabel, { color: mood.color }]}>
                {emotionLabel}
              </Text>
              <Text style={styles.emotionCode}>{emotionCode || "—"}</Text>
              <Text style={styles.time}>
                {item.emotionDate}
                {item.createdAt ? ` · ${formatCreatedTime(item.createdAt)}` : ""}
              </Text>
            </View>

            {previewText ? (
              <Text style={styles.preview} numberOfLines={3}>
                {previewText}
              </Text>
            ) : null}
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Тэмдэглэл засах"
          hitSlop={8}
          onPress={handlePressEdit}
          style={({ pressed }) => [styles.penButton, pressed && styles.pressed]}
        >
          <Ionicons name="pencil" size={18} color={CALENDAR_COLORS.primary} />
        </Pressable>
      </View>

      {item.hasAiAnalysis ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="AI анализ харах"
          onPress={() => {
            onPressAiAnalysis?.();
          }}
          style={({ pressed }) => [styles.aiButton, pressed && styles.pressed]}
        >
          <Ionicons name="sparkles" size={14} color="#FFFFFF" />
          <Text style={styles.aiButtonText}>AI анализ харах</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CALENDAR_COLORS.card,
    borderRadius: 20,
    padding: 14,
    gap: 12,
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  mainPressable: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
    minWidth: 0,
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
  meta: {
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  emotionCode: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
    color: CALENDAR_COLORS.primary,
  },
  time: {
    marginTop: 2,
    fontSize: 12,
    color: CALENDAR_COLORS.muted,
  },
  preview: {
    fontSize: 13,
    lineHeight: 19,
    color: CALENDAR_COLORS.title,
  },
  penButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3EEFF",
    alignItems: "center",
    justifyContent: "center",
  },
  aiButton: {
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: CALENDAR_COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  aiButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

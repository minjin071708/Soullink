import { CalendarEmptyState } from "@/features/calendar/components/CalendarEmptyState";
import { JournalPreviewCard } from "@/features/calendar/components/JournalPreviewCard";
import { CALENDAR_COLORS } from "@/features/calendar/constants/calendar.constants";
import type { CalendarJournalPreview } from "@/features/calendar/types/calendar.types";
import { formatSelectedDateMn } from "@/features/calendar/utils/calendar.utils";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type SelectedDateSectionProps = {
  selectedDate: string;
  diaryPreview: CalendarJournalPreview | null;
  exists: boolean;
  isLoading: boolean;
  isError: boolean;
  onPressJournal: (journal: CalendarJournalPreview) => void;
  onPressAiAnalysis: (journal: CalendarJournalPreview) => void;
  onRetry: () => void;
};

export function SelectedDateSection({
  selectedDate,
  diaryPreview,
  exists,
  isLoading,
  isError,
  onPressJournal,
  onPressAiAnalysis,
  onRetry,
}: SelectedDateSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.dateTitle}>{formatSelectedDateMn(selectedDate)}</Text>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={CALENDAR_COLORS.primary} />
        </View>
      ) : null}

      {!isLoading && isError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            Тэмдэглэлүүдийг ачаалж чадсангүй. Дахин оролдоно уу.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Дахин оролдох"
            onPress={onRetry}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryPressed,
            ]}
          >
            <Text style={styles.retryText}>Дахин оролдох</Text>
          </Pressable>
        </View>
      ) : null}

      {!isLoading && !isError && !exists ? <CalendarEmptyState /> : null}

      {!isLoading && !isError && exists && diaryPreview ? (
        <JournalPreviewCard
          item={diaryPreview}
          onPress={() => onPressJournal(diaryPreview)}
          onPressAiAnalysis={() => onPressAiAnalysis(diaryPreview)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    marginHorizontal: 16,
    gap: 12,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: CALENDAR_COLORS.title,
    marginBottom: 2,
  },
  loadingBox: {
    minHeight: 88,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: CALENDAR_COLORS.card,
  },
  errorBox: {
    borderRadius: 20,
    backgroundColor: CALENDAR_COLORS.card,
    padding: 16,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#D35A5A",
  },
  retryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F3EEFF",
  },
  retryPressed: {
    opacity: 0.85,
  },
  retryText: {
    fontSize: 13,
    fontWeight: "600",
    color: CALENDAR_COLORS.primary,
  },
});

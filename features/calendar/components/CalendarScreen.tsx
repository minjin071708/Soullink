import { CalendarHeader } from "@/features/calendar/components/CalendarHeader";
import { CalendarMascot } from "@/features/calendar/components/CalendarMascot";
import { CalendarSkeleton } from "@/features/calendar/components/CalendarSkeleton";
import { MonthSelector } from "@/features/calendar/components/MonthSelector";
import { MoodCalendar } from "@/features/calendar/components/MoodCalendar";
import { SelectedDateSection } from "@/features/calendar/components/SelectedDateSection";
import { CALENDAR_COLORS } from "@/features/calendar/constants/calendar.constants";
import { useCalendarMonth } from "@/features/calendar/hooks/useCalendarMonth";
import { useEmotionDiariesRange } from "@/features/calendar/hooks/useEmotionDiariesRange";
import { useJournalByDate } from "@/features/calendar/hooks/useJournalByDate";
import type { CalendarJournalPreview } from "@/features/calendar/types/calendar.types";
import {
  getTodayDateString,
  getYearMonth,
  mapDiaryByDateToPreview,
  resolveSelectedDateForMonth,
  shiftMonth,
} from "@/features/calendar/utils/calendar.utils";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function CalendarScreen() {
  const router = useRouter();
  const today = getTodayDateString();
  const initial = getYearMonth(today);

  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [selectedDate, setSelectedDate] = useState(today);

  const monthQuery = useCalendarMonth(year, month);
  const diaryQuery = useJournalByDate(selectedDate);
  const { data: diaries } = useEmotionDiariesRange(year, month);

  useEffect(() => {
    setSelectedDate((current) =>
      resolveSelectedDateForMonth(year, month, current, today)
    );
  }, [year, month, today]);

  const diariesByDate = useMemo(
    () =>
      Object.fromEntries(
        (diaries ?? []).map((diary) => [diary.emotionDate, diary])
      ),
    [diaries]
  );

  const diaryPreview = useMemo(() => {
    if (!diaryQuery.data?.exists) {
      return null;
    }
    return mapDiaryByDateToPreview(diaryQuery.data);
  }, [diaryQuery.data]);

  const handlePreviousMonth = () => {
    const next = shiftMonth(year, month, -1);
    setYear(next.year);
    setMonth(next.month);
  };

  const handleNextMonth = () => {
    const next = shiftMonth(year, month, 1);
    setYear(next.year);
    setMonth(next.month);
  };

  const handleSelectDate = (date: string) => {
    if (date > today) {
      return;
    }
    setSelectedDate(date);
  };

  const handlePressJournal = (journal: CalendarJournalPreview) => {
    router.push({
      pathname: "/calendar/journal/[diaryId]",
      params: { diaryId: String(journal.diaryId) },
    });
  };

  const handlePressAiAnalysis = (journal: CalendarJournalPreview) => {
    router.push({
      pathname: "/calendar/journal/[diaryId]",
      params: { diaryId: String(journal.diaryId) },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <CalendarHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <MonthSelector
          year={year}
          month={month}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />

        {monthQuery.isLoading ? <CalendarSkeleton variant="month" /> : null}

        {monthQuery.isError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              Календарийн мэдээллийг ачаалж чадсангүй.
            </Text>
          </View>
        ) : null}

        {monthQuery.data ? (
          <MoodCalendar
            year={year}
            month={month}
            days={monthQuery.data.days}
            selectedDate={selectedDate}
            diariesByDate={diariesByDate}
            onSelectDate={handleSelectDate}
          />
        ) : null}

        <SelectedDateSection
          selectedDate={selectedDate}
          diaryPreview={diaryPreview}
          exists={Boolean(diaryQuery.data?.exists)}
          isLoading={diaryQuery.isLoading}
          isError={diaryQuery.isError}
          onPressJournal={handlePressJournal}
          onPressAiAnalysis={handlePressAiAnalysis}
          onRetry={() => {
            void diaryQuery.refetch();
          }}
        />

        <CalendarMascot />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CALENDAR_COLORS.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  errorBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#FFECEC",
  },
  errorText: {
    color: "#D35A5A",
    fontSize: 14,
  },
});

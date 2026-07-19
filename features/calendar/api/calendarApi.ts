import {
  MOCK_CALENDAR_MONTH,
  MOCK_DAILY_ANALYSIS,
  MOCK_DAILY_JOURNALS,
  MOCK_JOURNAL_DETAILS,
} from "@/features/calendar/api/calendarMock";
import type {
  CalendarJournalPreview,
  CalendarMonthResponse,
  DailyAiAnalysis,
  JournalDetail,
} from "@/features/calendar/types/calendar.types";
import { getYearMonth } from "@/features/calendar/utils/calendar.utils";

/**
 * TODO: Replace with real backend endpoints when available.
 * Suggested shapes (do not invent production URLs yet):
 * - GET calendar month → { year, month, days: [{ date, mood, journalCount }] }
 * - GET daily journals → CalendarJournalPreview[]
 */

function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getCalendarMonth(
  year: number,
  month: number
): Promise<CalendarMonthResponse> {
  await delay();

  // Mock: reuse July 2026 sample days for any requested month by remapping dates.
  if (year === MOCK_CALENDAR_MONTH.year && month === MOCK_CALENDAR_MONTH.month) {
    return MOCK_CALENDAR_MONTH;
  }

  const remappedDays = MOCK_CALENDAR_MONTH.days
    .map((day) => {
      const dayNumber = Number(day.date.slice(8, 10));
      const lastDay = new Date(year, month, 0).getDate();
      if (dayNumber > lastDay) {
        return null;
      }

      const paddedMonth = String(month).padStart(2, "0");
      const paddedDay = String(dayNumber).padStart(2, "0");

      return {
        ...day,
        date: `${year}-${paddedMonth}-${paddedDay}`,
      };
    })
    .filter((day): day is NonNullable<typeof day> => day !== null);

  return {
    year,
    month,
    days: remappedDays,
  };
}

export async function getDailyJournals(
  date: string
): Promise<CalendarJournalPreview[]> {
  await delay();

  const direct = MOCK_DAILY_JOURNALS[date];
  if (direct) {
    return direct;
  }

  // Remap July mock entries onto the same day-of-month in other months.
  const { year, month } = getYearMonth(date);
  const dayNumber = date.slice(8, 10);
  const julyKey = `2026-07-${dayNumber}`;
  const julyEntries = MOCK_DAILY_JOURNALS[julyKey];

  if (!julyEntries) {
    return [];
  }

  const paddedMonth = String(month).padStart(2, "0");
  return julyEntries.map((entry) => ({
    ...entry,
    diaryId: entry.diaryId + year * 100 + month,
    date: `${year}-${paddedMonth}-${dayNumber}`,
  }));
}

/**
 * TODO: Connect to real journal detail endpoint.
 * Reuse existing journal APIs when the backend contract is ready.
 */
export async function getJournalDetail(
  diaryId: number
): Promise<JournalDetail | null> {
  await delay();
  return MOCK_JOURNAL_DETAILS[diaryId] ?? null;
}

/**
 * TODO: Connect to real daily AI analysis endpoint.
 */
export async function getDailyAiAnalysis(
  date: string
): Promise<DailyAiAnalysis | null> {
  await delay();

  if (MOCK_DAILY_ANALYSIS[date]) {
    return MOCK_DAILY_ANALYSIS[date];
  }

  const dayNumber = date.slice(8, 10);
  return MOCK_DAILY_ANALYSIS[`2026-07-${dayNumber}`] ?? null;
}

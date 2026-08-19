import {
  WEEKDAY_FULL_MN,
} from "@/features/calendar/constants/calendar.constants";
import type {
  CalendarDayCell,
  CalendarJournalPreview,
  CalendarMood,
  MoodType,
} from "@/features/calendar/types/calendar.types";
import type { EmotionDiaryByDateData } from "@/types/journalType";

/** Formats a local Date as yyyy-MM-dd without timezone shift. */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parses yyyy-MM-dd into a local Date (avoids `new Date("YYYY-MM-DD")` UTC bug). */
export function parseLocalDate(dateString: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) {
    throw new Error(`Invalid date string: ${dateString}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return new Date(year, month - 1, day);
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  try {
    const date = parseLocalDate(value);
    return formatLocalDate(date) === value;
  } catch {
    return false;
  }
}

export function getTodayDateString(): string {
  return formatLocalDate(new Date());
}

export function getYearMonth(dateString: string): { year: number; month: number } {
  const date = parseLocalDate(dateString);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}

export function shiftMonth(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  const date = new Date(year, month - 1 + delta, 1);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}

/** Inclusive month range as yyyy-MM-dd for emotion-diaries list API. */
export function getMonthDateRange(
  year: number,
  month: number
): { fromDate: string; toDate: string } {
  const lastDay = new Date(year, month, 0).getDate();
  const paddedMonth = String(month).padStart(2, "0");

  return {
    fromDate: `${year}-${paddedMonth}-01`,
    toDate: `${year}-${paddedMonth}-${String(lastDay).padStart(2, "0")}`,
  };
}

/** Monday = 0 ... Sunday = 6 */
export function getMondayBasedWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function formatMonthTitleMn(year: number, month: number): string {
  return `${year} оны ${month} сар`;
}

export function formatSelectedDateMn(dateString: string): string {
  const date = parseLocalDate(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = WEEKDAY_FULL_MN[getMondayBasedWeekday(date)];
  return `${month} сарын ${day}, ${weekday}`;
}

/** Formats `emotionDate` (yyyy-MM-dd) for the current app language. */
export function formatEmotionDateLocalized(
  dateString: string,
  language: "EN" | "KO" | "MN" | null | undefined
): string {
  if (!dateString) {
    return "";
  }

  if (language === "MN" || !language) {
    try {
      return formatSelectedDateMn(dateString);
    } catch {
      return dateString;
    }
  }

  try {
    const date = parseLocalDate(dateString);
    const locale = language === "KO" ? "ko-KR" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatJournalDateTimeMn(dateString: string, createdAt: string): string {
  const date = parseLocalDate(dateString);
  const timeMatch = /T(\d{2}:\d{2})/.exec(createdAt);
  const time = timeMatch?.[1] ?? createdAt.slice(11, 16);
  return `${date.getFullYear()} оны ${date.getMonth() + 1} сарын ${date.getDate()} • ${time}`;
}

export function formatAnalysisDateMn(dateString: string): string {
  const date = parseLocalDate(dateString);
  return `${date.getFullYear()} оны ${date.getMonth() + 1} сарын ${date.getDate()}`;
}

export function formatCreatedTime(createdAt: string): string {
  const timeMatch = /T(\d{2}:\d{2})/.exec(createdAt);
  if (timeMatch) {
    return timeMatch[1];
  }

  return createdAt.slice(11, 16);
}

/**
 * Builds a Monday-first calendar grid for the given month.
 * Out-of-month filler cells have `date: null` (invisible placeholders).
 */
export function buildMonthGrid(params: {
  year: number;
  month: number;
  moodByDate: Map<string, CalendarMood>;
  today: string;
}): CalendarDayCell[] {
  const { year, month, moodByDate, today } = params;
  const firstOfMonth = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leadingPlaceholders = getMondayBasedWeekday(firstOfMonth);

  const cells: CalendarDayCell[] = [];

  for (let i = 0; i < leadingPlaceholders; i += 1) {
    cells.push({
      key: `pad-start-${i}`,
      date: null,
      dayNumber: null,
      isCurrentMonth: false,
      isToday: false,
      isFuture: false,
      journalCount: 0,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = formatLocalDate(new Date(year, month - 1, day));
    const moodEntry = moodByDate.get(date);

    cells.push({
      key: date,
      date,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: date === today,
      isFuture: date > today,
      mood: moodEntry?.mood,
      journalCount: moodEntry?.journalCount ?? 0,
    });
  }

  while (cells.length % 7 !== 0) {
    const index = cells.length;
    cells.push({
      key: `pad-end-${index}`,
      date: null,
      dayNumber: null,
      isCurrentMonth: false,
      isToday: false,
      isFuture: false,
      journalCount: 0,
    });
  }

  return cells;
}

export function resolveSelectedDateForMonth(
  year: number,
  month: number,
  preferredDate: string,
  today: string
): string {
  const preferred = getYearMonth(preferredDate);
  if (preferred.year === year && preferred.month === month) {
    return preferredDate <= today ? preferredDate : today;
  }

  const candidate = formatLocalDate(new Date(year, month - 1, 1));
  if (year === getYearMonth(today).year && month === getYearMonth(today).month) {
    return today;
  }

  if (candidate > today) {
    return today;
  }

  const lastDay = formatLocalDate(new Date(year, month, 0));
  return lastDay <= today ? lastDay : today;
}

export function toMoodMap(days: CalendarMood[]): Map<string, CalendarMood> {
  const map = new Map<string, CalendarMood>();
  for (const day of days) {
    map.set(day.date, day);
  }
  return map;
}

/** Maps backend emotionCode values onto calendar MoodType for UI assets. */
export function emotionCodeToMoodType(emotionCode: string): MoodType {
  switch (emotionCode.toUpperCase()) {
    case "ANGRY":
    case "ANXIOUS":
      return "bad";
    case "SAD":
      return "sad";
    case "NORMAL":
    case "TIRED":
      return "normal";
    case "CALM":
      return "good";
    case "HAPPY":
      return "happy";
    default:
      return "normal";
  }
}

export function mapDiaryByDateToPreview(
  diary: EmotionDiaryByDateData
): CalendarJournalPreview {
  const contentPreview =
    diary.contentPreview?.trim() ||
    diary.content?.trim() ||
    diary.title?.trim() ||
    "";
  const aiAnalysisSummary = diary.aiAnalysisSummary?.trim() || null;

  return {
    diaryId: diary.diaryId,
    date: diary.emotionDate || "",
    emotionDate: diary.emotionDate || "",
    emotionCode: diary.emotionCode || "",
    emotionName: diary.emotionName || "",
    createdAt: diary.createdAt || "",
    mood: emotionCodeToMoodType(diary.emotionCode || "CALM"),
    contentPreview,
    aiAnalysisSummary,
    riskLevel: diary.riskLevel ?? null,
    hasAiAnalysis: Boolean(aiAnalysisSummary) ||
      diary.analysisStatus === "SUCCESS" ||
      diary.analysisStatus === "READY",
  };
}

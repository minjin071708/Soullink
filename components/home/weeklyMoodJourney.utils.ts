import { MOODS } from "@/constants/moods";
import type { EmotionDiariesListItem } from "@/types/journalType";
import type { MoodId } from "@/types/moodType";
import { EMOTION_CODES } from "@/types/emotionType";
import type {
  WeekDayItem,
  WeeklyJournalPreview,
} from "@/types/weeklyJournalType";
import { formatEmotionDate } from "@/utils/emotionDate";
import { formatCreatedTime } from "@/features/calendar/utils/calendar.utils";

const WEEKDAY_KEYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

function getMondayOfWeek(date = new Date()): Date {
  const start = new Date(date);
  const weekday = start.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

/** Monday–Sunday week containing `referenceDate`. */
export function buildWeekDays(referenceDate = new Date()): WeekDayItem[] {
  const monday = getMondayOfWeek(referenceDate);

  return WEEKDAY_KEYS.map((dayKey, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      date: formatEmotionDate(date),
      dayKey,
      dayNumber: date.getDate(),
    };
  });
}

export function getWeekDateRange(referenceDate = new Date()): {
  fromDate: string;
  toDate: string;
} {
  const days = buildWeekDays(referenceDate);
  return {
    fromDate: days[0].date,
    toDate: days[days.length - 1].date,
  };
}

function toMoodId(emotionCode: string | undefined): MoodId | undefined {
  if (!emotionCode) {
    return undefined;
  }

  const upper = emotionCode.trim().toUpperCase();
  return (EMOTION_CODES as readonly string[]).includes(upper)
    ? (upper as MoodId)
    : undefined;
}

function formatSleepHours(hours: number | null | undefined): string | undefined {
  if (hours == null || Number.isNaN(hours)) {
    return undefined;
  }

  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);

  if (minutes <= 0) {
    return `${whole}h`;
  }

  return `${whole}h ${String(minutes).padStart(2, "0")}m`;
}

export function mapDiaryToWeeklyJournalPreview(
  diary: EmotionDiariesListItem,
  todayIso: string
): WeeklyJournalPreview {
  const date = diary.emotionDate;
  const tagFromNames = diary.tagNames?.find((name) => name.trim().length > 0);
  const tagFromObjects = diary.tags?.find((tag) => tag.tagName.trim().length > 0)
    ?.tagName;

  const preview =
    diary.contentPreview?.trim() ||
    diary.content?.trim() ||
    diary.title?.trim() ||
    undefined;

  return {
    date,
    moodId: toMoodId(diary.emotionCode),
    emotionName: diary.emotionName?.trim() || undefined,
    timeLabel: diary.createdAt ? formatCreatedTime(diary.createdAt) : undefined,
    temperature: diary.weatherName?.trim() || undefined,
    sleep: formatSleepHours(diary.sleepHours),
    tag: tagFromNames ?? tagFromObjects,
    preview,
    isToday: date === todayIso,
  };
}

export function mapDiariesToWeeklyJournalMap(
  diaries: EmotionDiariesListItem[],
  weekDays: WeekDayItem[],
  todayIso: string
): Record<string, WeeklyJournalPreview> {
  const byDate = new Map<string, EmotionDiariesListItem>();

  for (const diary of diaries) {
    if (!diary.emotionDate) {
      continue;
    }
    // Prefer the latest entry if duplicates appear for one day
    const existing = byDate.get(diary.emotionDate);
    if (!existing) {
      byDate.set(diary.emotionDate, diary);
      continue;
    }
    if ((diary.createdAt ?? "") > (existing.createdAt ?? "")) {
      byDate.set(diary.emotionDate, diary);
    }
  }

  const map: Record<string, WeeklyJournalPreview> = {};

  for (const day of weekDays) {
    const diary = byDate.get(day.date);
    map[day.date] = diary
      ? mapDiaryToWeeklyJournalPreview(diary, todayIso)
      : { date: day.date, isToday: day.date === todayIso };
  }

  return map;
}

export function getMoodImage(moodId: MoodId) {
  return MOODS.find((mood) => mood.id === moodId)?.image;
}

export function getMoodLabelKey(moodId: MoodId) {
  return MOODS.find((mood) => mood.id === moodId)?.labelKey;
}

export { formatEmotionDate as toIsoDate };

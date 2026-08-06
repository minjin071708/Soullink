import { MOODS } from "@/constants/moods";
import type {
  WeekDayItem,
  WeeklyJournalPreview,
} from "@/types/weeklyJournalType";
import type { MoodId } from "@/types/moodType";

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMondayOfWeek(date = new Date()): Date {
  const start = new Date(date);
  const weekday = start.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

const WEEKDAY_KEYS = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
] as const;

/** Temporary mock data until weekly journal API is connected. */
export function buildMockWeekDays(referenceDate = new Date()): WeekDayItem[] {
  const monday = getMondayOfWeek(referenceDate);

  return WEEKDAY_KEYS.map((dayKey, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      date: toIsoDate(date),
      dayKey,
      dayNumber: date.getDate(),
    };
  });
}

type MockJournalSeed = {
  moodId: MoodId;
  timeLabel: string;
  temperature: string;
  sleep: string;
  tagKey: string;
  previewKey: string;
};

const MOCK_SEEDS: MockJournalSeed[] = [
  {
    moodId: "ANGRY",
    timeLabel: "8:15 AM",
    temperature: "22°C",
    sleep: "6h 45m",
    tagKey: "home.weeklyJournal.tags.focused",
    previewKey: "home.weeklyJournal.previews.mon",
  },
  {
    moodId: "HAPPY",
    timeLabel: "9:30 AM",
    temperature: "24°C",
    sleep: "7h 30m",
    tagKey: "home.weeklyJournal.tags.grateful",
    previewKey: "home.weeklyJournal.previews.tue",
  },
  {
    moodId: "CALM",
    timeLabel: "7:50 PM",
    temperature: "21°C",
    sleep: "7h 10m",
    tagKey: "home.weeklyJournal.tags.peaceful",
    previewKey: "home.weeklyJournal.previews.wed",
  },
  {
    moodId: "ANXIOUS",
    timeLabel: "2:10 PM",
    temperature: "23°C",
    sleep: "6h 20m",
    tagKey: "home.weeklyJournal.tags.reflective",
    previewKey: "home.weeklyJournal.previews.thu",
  },
  {
    moodId: "SAD",
    timeLabel: "6:40 PM",
    temperature: "20°C",
    sleep: "7h 00m",
    tagKey: "home.weeklyJournal.tags.gentle",
    previewKey: "home.weeklyJournal.previews.fri",
  },
  {
    moodId: "TIRED",
    timeLabel: "10:05 PM",
    temperature: "19°C",
    sleep: "5h 50m",
    tagKey: "home.weeklyJournal.tags.rest",
    previewKey: "home.weeklyJournal.previews.sat",
  },
];

export function buildMockJournalMap(
  weekDays: WeekDayItem[],
  todayIso = toIsoDate(new Date())
): Record<string, WeeklyJournalPreview> {
  const map: Record<string, WeeklyJournalPreview> = {};

  weekDays.forEach((day, index) => {
    const seed = MOCK_SEEDS[index];
    if (!seed) {
      return;
    }

    map[day.date] = {
      date: day.date,
      moodId: seed.moodId,
      timeLabel: seed.timeLabel,
      temperature: seed.temperature,
      sleep: seed.sleep,
      tag: seed.tagKey,
      preview: seed.previewKey,
      isToday: day.date === todayIso,
    };
  });

  return map;
}

export function getMoodImage(moodId: MoodId) {
  return MOODS.find((mood) => mood.id === moodId)?.image;
}

export function getMoodLabelKey(moodId: MoodId) {
  return MOODS.find((mood) => mood.id === moodId)?.labelKey;
}

export { toIsoDate };

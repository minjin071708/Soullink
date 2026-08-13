import type { MoodId } from "@/types/moodType";

export type WeekdayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type WeekDayItem = {
  /** ISO date YYYY-MM-DD */
  date: string;
  dayKey: WeekdayKey;
  dayNumber: number;
};

export type WeeklyJournalPreview = {
  date: string;
  moodId?: MoodId;
  /** Backend emotionName when available */
  emotionName?: string;
  timeLabel?: string;
  temperature?: string;
  sleep?: string;
  /** Display tag name (not an i18n key) */
  tag?: string;
  /** Diary content preview text (not an i18n key) */
  preview?: string;
  isToday?: boolean;
};

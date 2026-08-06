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
  timeLabel?: string;
  temperature?: string;
  sleep?: string;
  tag?: string;
  preview?: string;
  isToday?: boolean;
};

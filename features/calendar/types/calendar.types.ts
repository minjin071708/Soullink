import type { ImageSourcePropType } from "react-native";

export type MoodType = "bad" | "sad" | "normal" | "good" | "happy";

export type CalendarMood = {
  date: string;
  mood: MoodType;
  journalCount: number;
};

export type CalendarMonthResponse = {
  year: number;
  month: number;
  days: CalendarMood[];
};

export type CalendarJournalPreview = {
  diaryId: number;
  date: string;
  createdAt: string;
  mood: MoodType;
  contentPreview: string;
  hasAiAnalysis: boolean;
};

export type MoodConfig = {
  label: string;
  color: string;
  image: ImageSourcePropType;
};

export type CalendarDayCell = {
  key: string;
  date: string | null;
  dayNumber: number | null;
  isCurrentMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  mood?: MoodType;
  journalCount: number;
};

export type DailyAiAnalysis = {
  date: string;
  headline: string;
  primaryEmotion: string;
  trigger: string;
  thoughtPattern: string;
  adviceTitle: string;
  adviceBody: string;
};

export type JournalDetail = {
  diaryId: number;
  date: string;
  createdAt: string;
  mood: MoodType;
  content: string;
  hasAiAnalysis: boolean;
  weatherLabel?: string;
  primaryEmotion?: string;
  trigger?: string;
  thought?: string;
};

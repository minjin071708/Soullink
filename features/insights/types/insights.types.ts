export type InsightPeriod = "day" | "week" | "month";

export type InsightEmotionKey =
  | "CALM"
  | "HAPPY"
  | "ANXIOUS"
  | "ANGRY"
  | "SAD"
  | "NEUTRAL";

export type InsightEmotionShare = {
  key: InsightEmotionKey;
  label: string;
  count: number;
  color: string;
};

export type InsightObservation = {
  id: string;
  title: string;
  subtitle: string;
  icon: "recurring" | "helpful";
  accent: string;
};

export type PreviousReport = {
  id: string;
  analysisId: number;
  title: string;
  moodLabel: string;
  moodColor: string;
  icon: "cloud" | "sun";
};

/** View model for weekly/monthly insight cards (mapped from API). */
export type WeeklyInsightCardModel = {
  periodLabel: string;
  dateRangeLabel: string;
  headline: string;
  recordedDays: number;
  totalRecordedDays: number;
  totalDays: number;
  journalCount: number;
  dominantEmotion: {
    label: string;
    daysLabel: string;
    color: string;
  };
  emotionShares: InsightEmotionShare[];
  aiObservation: string;
  observations: InsightObservation[];
  previousReports: PreviousReport[];
};

/** @deprecated Prefer WeeklyInsightCardModel */
export type WeeklyInsightMock = WeeklyInsightCardModel;

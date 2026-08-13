import type { EmotionCode } from "@/types/emotionType";
import type { z } from "zod";
import {
  monthlyEmotionStatisticsDataSchema,
  monthlyEmotionStatisticsResponseSchema,
} from "../schemas/emotionStatisticsSchema";

export type WeeklyEmotionPeriod = {
  startDate: string;
  endDate: string;
};

export type WeeklyDominantEmotion = {
  code: EmotionCode;
  name: string;
};

export type WeeklyDailyScore = {
  date: string;
  /** Diary бичээгүй өдөр response-д field өөрөө байхгүй. */
  emotionCode?: EmotionCode;
};

export type WeeklyEmotionDistribution = {
  emotionCode: EmotionCode;
  emotionName: string;
  count: number;
  ratio: number;
};

export type WeeklyTopTag = {
  tagId: number;
  tagName: string;
  count: number;
};

export type WeeklyEmotionStatisticsData = {
  period: WeeklyEmotionPeriod;
  recordedDays: number;
  dominantEmotion: WeeklyDominantEmotion | null;
  dailyScores: WeeklyDailyScore[];
  emotionDistribution: WeeklyEmotionDistribution[];
  topTags: WeeklyTopTag[];
};

export type WeeklyEmotionStatisticsResponse = {
  success: boolean;
  code: string;
  message: string;
  data: WeeklyEmotionStatisticsData;
  requestId: string;
};

/** @deprecated Prefer WeeklyEmotionPeriod — kept for existing imports */
export type WeeklyStatisticsPeriod = WeeklyEmotionPeriod;

/** @deprecated Prefer WeeklyDominantEmotion */
export type DominantEmotion = WeeklyDominantEmotion;

/** @deprecated Prefer WeeklyDailyScore */
export type DailyEmotionScore = WeeklyDailyScore;

/** Shared distribution item (weekly + monthly) */
export type EmotionDistribution = WeeklyEmotionDistribution;

/** Shared top tag (weekly + monthly) */
export type EmotionTopTag = WeeklyTopTag;

export type GetWeeklyEmotionStatisticsRequest = {
  /** yyyy-MM-dd — backend resolves the week that contains this date */
  baseDate?: string;
};

export type MonthlyEmotionStatisticsResponse = z.infer<
  typeof monthlyEmotionStatisticsResponseSchema
>;

export type MonthlyEmotionStatisticsData = z.infer<
  typeof monthlyEmotionStatisticsDataSchema
>;

export type MonthlyStatisticsPeriod =
  MonthlyEmotionStatisticsData["period"];

export type MonthlyScoreDay = NonNullable<
  MonthlyEmotionStatisticsData["bestDay"]
>;

export type WeeklyAverage =
  MonthlyEmotionStatisticsData["weeklyAverages"][number];

export type GetMonthlyEmotionStatisticsParams = {
  /** yyyy-MM-dd, default: today */
  baseDate?: string;
};

import type { z } from "zod";
import {
  monthlyEmotionStatisticsDataSchema,
  monthlyEmotionStatisticsResponseSchema,
  weeklyEmotionStatisticsDataSchema,
  weeklyEmotionStatisticsResponseSchema,
} from "../schemas/emotionStatisticsSchema";

export type WeeklyEmotionStatisticsResponse = z.infer<
  typeof weeklyEmotionStatisticsResponseSchema
>;

export type WeeklyEmotionStatisticsData = z.infer<
  typeof weeklyEmotionStatisticsDataSchema
>;

export type WeeklyStatisticsPeriod =
  WeeklyEmotionStatisticsData["period"];

export type DominantEmotion = NonNullable<
  WeeklyEmotionStatisticsData["dominantEmotion"]
>;

export type DailyEmotionScore =
  WeeklyEmotionStatisticsData["dailyScores"][number];

export type EmotionDistribution =
  WeeklyEmotionStatisticsData["emotionDistribution"][number];

export type EmotionTopTag =
  WeeklyEmotionStatisticsData["topTags"][number];

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

import { EMOTION_CODES } from "@/types/emotionType";
import { z } from "zod";

export const emotionCodeSchema = z.enum(EMOTION_CODES);

export const weeklyStatisticsPeriodSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

export const weeklyDominantEmotionSchema = z.object({
  code: emotionCodeSchema,
  name: z.string(),
});

/**
 * Diary бичээгүй өдөр `emotionCode` field өөрөө байхгүй.
 */
export const weeklyDailyScoreSchema = z.object({
  date: z.string(),
  emotionCode: emotionCodeSchema.optional(),
});

export const emotionDistributionSchema = z.object({
  emotionCode: emotionCodeSchema,
  emotionName: z.string(),
  count: z.number().int().nonnegative(),
  ratio: z.number(),
});

export const emotionTopTagSchema = z.object({
  tagId: z.number().int(),
  tagName: z.string(),
  count: z.number().int().nonnegative(),
});

export const weeklyEmotionStatisticsDataSchema = z.object({
  period: weeklyStatisticsPeriodSchema,
  recordedDays: z.number().int().nonnegative(),
  dominantEmotion: weeklyDominantEmotionSchema.nullable(),
  dailyScores: z.array(weeklyDailyScoreSchema),
  emotionDistribution: z.array(emotionDistributionSchema),
  topTags: z.array(emotionTopTagSchema),
});

export const weeklyEmotionStatisticsResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: weeklyEmotionStatisticsDataSchema,
  requestId: z.string().optional().default(""),
});

export const monthlyScoreDaySchema = z.object({
  date: z.string(),
  score: z.number(),
});

/** Backend may omit averageScore when that week has no diary scores. */
export const weeklyAverageSchema = z.object({
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  averageScore: z.number().nullable().optional(),
});

/**
 * Monthly STAT response — optional score fields may be omitted when insufficient data.
 */
export const monthlyEmotionStatisticsDataSchema = z.object({
  period: weeklyStatisticsPeriodSchema,
  recordedDays: z.number().int().nonnegative(),
  recordRate: z.number(),
  averageScore: z.number().nullable().optional(),
  scoreChange: z.number().nullable().optional(),
  bestDay: monthlyScoreDaySchema.nullable().optional(),
  lowestDay: monthlyScoreDaySchema.nullable().optional(),
  weeklyAverages: z.array(weeklyAverageSchema).default([]),
  emotionDistribution: z.array(emotionDistributionSchema).default([]),
  topTags: z.array(emotionTopTagSchema).default([]),
  sleepCorrelation: z.number().nullable().optional(),
});

export const monthlyEmotionStatisticsResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: monthlyEmotionStatisticsDataSchema,
  requestId: z.string().optional().default(""),
});

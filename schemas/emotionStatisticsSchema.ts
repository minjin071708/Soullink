import { z } from "zod";

export const weeklyStatisticsPeriodSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

export const dominantEmotionSchema = z.object({
  code: z.string(),
  name: z.string(),
});

export const dailyEmotionScoreSchema = z.object({
  date: z.string(),
  score: z.number().nullable(),
  emotionCode: z.string().nullable(),
});

export const emotionDistributionSchema = z.object({
  emotionCode: z.string(),
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
  averageScore: z.number().nullable(),
  scoreChange: z.number().nullable(),
  dominantEmotion: dominantEmotionSchema.nullable(),
  dailyScores: z.array(dailyEmotionScoreSchema),
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

export const weeklyAverageSchema = z.object({
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  averageScore: z.number().nullable(),
});

export const monthlyEmotionStatisticsDataSchema = z.object({
  period: weeklyStatisticsPeriodSchema,
  recordedDays: z.number().int().nonnegative(),
  recordRate: z.number(),
  averageScore: z.number().nullable(),
  scoreChange: z.number().nullable(),
  bestDay: monthlyScoreDaySchema.nullable(),
  lowestDay: monthlyScoreDaySchema.nullable(),
  weeklyAverages: z.array(weeklyAverageSchema),
  emotionDistribution: z.array(emotionDistributionSchema),
  topTags: z.array(emotionTopTagSchema),
  sleepCorrelation: z.number().nullable(),
});

export const monthlyEmotionStatisticsResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: monthlyEmotionStatisticsDataSchema,
  requestId: z.string().optional().default(""),
});

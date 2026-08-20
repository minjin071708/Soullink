import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const statisticsPeriodSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

/** @deprecated Prefer statisticsPeriodSchema */
export const weeklyStatisticsPeriodSchema = statisticsPeriodSchema;

export const dominantEmotionSchema = z.object({
  code: z.string(),
  name: z.string(),
});

/** @deprecated Prefer dominantEmotionSchema */
export const weeklyDominantEmotionSchema = dominantEmotionSchema;

/**
 * Diary бичээгүй өдөр `emotionCode` field өөрөө байхгүй.
 */
export const dailyEmotionScoreSchema = z.object({
  date: z.string(),
  emotionCode: z.string().optional(),
});

/** @deprecated Prefer dailyEmotionScoreSchema */
export const weeklyDailyScoreSchema = dailyEmotionScoreSchema;

export const emotionDistributionItemSchema = z.object({
  emotionCode: z.string(),
  emotionName: z.string(),
  count: z.number().int().nonnegative(),
  ratio: z.number().min(0).max(100),
});

/** Shared distribution item (weekly + monthly) */
export const emotionDistributionSchema = emotionDistributionItemSchema;

export const emotionTopTagSchema = z.object({
  tagId: z.number().int(),
  tagName: z.string(),
  count: z.number().int().nonnegative(),
});

export const aiInsightSchema = z.object({
  analysisId: z.number().int().positive(),
  status: z.string(),
  title: z.string(),
  content: z.string(),
});

export const recentReportSchema = z.object({
  analysisId: z.number().int().positive(),
  analysisType: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  period: statisticsPeriodSchema,
  resultType: z.string(),
  resultCode: z.string(),
  resultName: z.string(),
});

export const weeklyStatisticsRequestSchema = z.object({
  /**
   * 7 хоногийн хугацааны төгсгөлийн өдөр.
   * Илгээхгүй бол backend өнөөдрөөр тооцно.
   */
  baseDate: z
    .string()
    .regex(dateRegex, "baseDate must use yyyy-MM-dd format")
    .optional(),
});

export const weeklyStatisticsDataSchema = z.object({
  period: statisticsPeriodSchema,
  /** Энэ долоо хоногт тэмдэглэл бичсэн өдрийн тоо */
  recordedDays: z.number().int().nonnegative(),
  /** Одоог хүртэл нийт тэмдэглэл бичсэн өдрийн тоо */
  totalRecordedDays: z.number().int().nonnegative(),
  dominantEmotion: dominantEmotionSchema.nullable(),
  dailyScores: z.array(dailyEmotionScoreSchema),
  emotionDistribution: z.array(emotionDistributionItemSchema),
  /** topTags item бүтэц response дээр хараахан тодорхойгүй. */
  topTags: z.array(z.unknown()),
  aiInsight: aiInsightSchema.nullable(),
  recentReports: z.array(recentReportSchema),
  hasMoreReports: z.boolean(),
});

/** @deprecated Prefer weeklyStatisticsDataSchema */
export const weeklyEmotionStatisticsDataSchema = weeklyStatisticsDataSchema;

export const weeklyStatisticsResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: weeklyStatisticsDataSchema,
  requestId: z.string(),
});

/** @deprecated Prefer weeklyStatisticsResponseSchema */
export const weeklyEmotionStatisticsResponseSchema =
  weeklyStatisticsResponseSchema;

export const monthlyStatisticsPeriodSchema = statisticsPeriodSchema;

/**
 * Monthly STAT-002 weekly bucket. Response only includes week bounds.
 */
export const weeklyAverageSchema = z.object({
  weekStartDate: z.string(),
  weekEndDate: z.string(),
  averageScore: z.number().optional(),
  dominantEmotionCode: z.string().optional(),
});

export const monthlyEmotionDistributionItemSchema =
  emotionDistributionItemSchema;

export const monthlyStatisticsDataSchema = z.object({
  period: monthlyStatisticsPeriodSchema,
  /** Сонгосон хугацаанд тэмдэглэлтэй өдрийн тоо */
  recordedDays: z.number().int().nonnegative(),
  /** Нийт хугацаанаас хэдэн хувьд нь тэмдэглэл бичсэн (API: recordRate) */
  recordRate: z.number().min(0).max(100),
  weeklyAverages: z.array(weeklyAverageSchema),
  emotionDistribution: z.array(monthlyEmotionDistributionItemSchema),
  topTags: z.array(emotionTopTagSchema).default([]),
  /** Monthly response may omit this field */
  aiInsight: aiInsightSchema.nullable().optional().default(null),
});

/** @deprecated Prefer monthlyStatisticsDataSchema */
export const monthlyEmotionStatisticsDataSchema = monthlyStatisticsDataSchema;

export const monthlyStatisticsResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: monthlyStatisticsDataSchema,
  requestId: z.string(),
});

/** @deprecated Prefer monthlyStatisticsResponseSchema */
export const monthlyEmotionStatisticsResponseSchema =
  monthlyStatisticsResponseSchema;

export const weeklyReportPeriodSchema = statisticsPeriodSchema;

export const weeklyReportEmotionSchema = dominantEmotionSchema;

export const weeklyReportDailyScoreSchema = dailyEmotionScoreSchema;

export const weeklyReportEmotionDistributionSchema =
  emotionDistributionItemSchema;

export const weeklyReportTopTagSchema = z.object({
  tagId: z.number().int().positive(),
  tagName: z.string(),
  count: z.number().int().nonnegative(),
});

export const weeklyReportAiInsightSchema = z.object({
  analysisId: z.number().int().positive(),
  status: z.enum([
    "NONE",
    "REQUESTED",
    "PROCESSING",
    "READY",
    "SUCCESS",
    "FAILED",
    "INVALIDATED",
  ]),
  title: z.string(),
  content: z.string(),
});

export const recentWeeklyReportSchema = recentReportSchema;

export const weeklyReportDetailDataSchema = z.object({
  period: weeklyReportPeriodSchema,
  recordedDays: z.number().int().nonnegative(),
  totalRecordedDays: z.number().int().nonnegative(),
  dominantEmotion: weeklyReportEmotionSchema.nullable(),
  dailyScores: z.array(weeklyReportDailyScoreSchema),
  emotionDistribution: z.array(weeklyReportEmotionDistributionSchema),
  topTags: z.array(weeklyReportTopTagSchema),
  aiInsight: weeklyReportAiInsightSchema.nullable(),
  recentReports: z.array(recentWeeklyReportSchema),
  hasMoreReports: z.boolean(),
});

export const weeklyReportDetailResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: weeklyReportDetailDataSchema,
  requestId: z.string(),
});

/** @deprecated Removed from monthly STAT response */
export const monthlyScoreDaySchema = z.object({
  date: z.string(),
  score: z.number(),
});

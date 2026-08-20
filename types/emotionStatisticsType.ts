import type { z } from "zod";
import {
  aiInsightSchema,
  dailyEmotionScoreSchema,
  dominantEmotionSchema,
  emotionDistributionItemSchema,
  emotionTopTagSchema,
  monthlyStatisticsDataSchema,
  monthlyStatisticsResponseSchema,
  recentReportSchema,
  statisticsPeriodSchema,
  weeklyAverageSchema,
  weeklyStatisticsDataSchema,
  weeklyStatisticsRequestSchema,
  weeklyStatisticsResponseSchema,
  weeklyReportPeriodSchema,
  weeklyReportDailyScoreSchema,
  weeklyReportEmotionDistributionSchema,
  weeklyReportTopTagSchema,
  weeklyReportAiInsightSchema,
  recentWeeklyReportSchema,
  weeklyReportDetailDataSchema,
  weeklyReportDetailResponseSchema,
} from "../schemas/emotionStatisticsSchema";

export type StatisticsPeriod = z.infer<typeof statisticsPeriodSchema>;
export type DominantEmotion = z.infer<typeof dominantEmotionSchema>;
export type DailyEmotionScore = z.infer<typeof dailyEmotionScoreSchema>;
export type EmotionDistributionItem = z.infer<
  typeof emotionDistributionItemSchema
>;
export type AiInsight = z.infer<typeof aiInsightSchema>;
export type RecentReport = z.infer<typeof recentReportSchema>;
export type WeeklyStatisticsRequest = z.infer<
  typeof weeklyStatisticsRequestSchema
>;
export type WeeklyStatisticsData = z.infer<typeof weeklyStatisticsDataSchema>;
export type WeeklyStatisticsResponse = z.infer<
  typeof weeklyStatisticsResponseSchema
>;

/** Aliases used across the app */
export type WeeklyEmotionPeriod = StatisticsPeriod;
export type WeeklyDominantEmotion = DominantEmotion;
export type WeeklyDailyScore = DailyEmotionScore;
export type WeeklyEmotionDistribution = EmotionDistributionItem;
export type EmotionDistribution = EmotionDistributionItem;
export type EmotionTopTag = z.infer<typeof emotionTopTagSchema>;
export type WeeklyEmotionStatisticsData = WeeklyStatisticsData;
export type WeeklyEmotionStatisticsResponse = WeeklyStatisticsResponse;
export type GetWeeklyEmotionStatisticsRequest = WeeklyStatisticsRequest;

/** @deprecated Prefer StatisticsPeriod */
export type WeeklyStatisticsPeriod = StatisticsPeriod;

export type WeeklyAverage = z.infer<typeof weeklyAverageSchema>;
export type MonthlyStatisticsData = z.infer<typeof monthlyStatisticsDataSchema>;
export type MonthlyStatisticsResponse = z.infer<
  typeof monthlyStatisticsResponseSchema
>;
export type MonthlyStatisticsPeriod = MonthlyStatisticsData["period"];
export type MonthlyEmotionDistributionItem = EmotionDistributionItem;

/** Aliases for existing imports */
export type MonthlyEmotionStatisticsData = MonthlyStatisticsData;
export type MonthlyEmotionStatisticsResponse = MonthlyStatisticsResponse;

export type GetMonthlyEmotionStatisticsParams = {
  /** yyyy-MM-dd, default: today */
  baseDate?: string;
};

export type WeeklyReportPeriod = z.infer<typeof weeklyReportPeriodSchema>;
export type WeeklyReportDailyScore = z.infer<
  typeof weeklyReportDailyScoreSchema
>;
export type WeeklyReportEmotionDistribution = z.infer<
  typeof weeklyReportEmotionDistributionSchema
>;
export type WeeklyReportTopTag = z.infer<typeof weeklyReportTopTagSchema>;
export type WeeklyReportAiInsight = z.infer<typeof weeklyReportAiInsightSchema>;
export type RecentWeeklyReport = z.infer<typeof recentWeeklyReportSchema>;
export type WeeklyReportDetailData = z.infer<
  typeof weeklyReportDetailDataSchema
>;
export type WeeklyReportDetailResponse = z.infer<
  typeof weeklyReportDetailResponseSchema
>;

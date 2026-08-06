import { z } from "zod";

export const analysisTypeSchema = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);

export const analysisStatusSchema = z.enum([
  "REQUESTED",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
  "INVALIDATED",
]);

export const scoreTrendSchema = z.enum([
  "IMPROVING",
  "STABLE",
  "DECLINING",
  "INSUFFICIENT",
]);

export const safetyRiskLevelSchema = z.enum([
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
]);

const weeklyAnalysisPeriodSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

const weeklyMainEmotionSchema = z.object({
  code: z.string().max(30).nullable(),
  name: z.string().max(50).nullable(),
});

const weeklyKeyPatternSchema = z.object({
  patternCode: z.string().max(50),
  title: z.string().max(100),
  description: z.string().max(500),
  confidence: z.number().min(0).max(1).nullable(),
});

const weeklyTriggerSchema = z.object({
  tagCode: z.string(),
  tagName: z.string(),
  count: z.number(),
});

const weeklyRecommendationSchema = z.object({
  recommendationId: z.string().max(50),
  title: z.string().max(100),
  description: z.string().max(500),
  priority: z.number().int().min(1).max(5),
});

const weeklySafetySchema = z.object({
  riskLevel: safetyRiskLevelSchema,
  showHelpGuide: z.boolean(),
});

const weeklyComparisonSchema = z.object({
  previousAverageScore: z.number().min(1).max(10).nullable(),
  scoreDifference: z.number().nullable(),
  description: z.string().max(300).nullable(),
});

const weeklyDailyHighlightSchema = z.object({
  date: z.string(),
  emotionCode: z.string(),
  score: z.number().int().min(1).max(10),
  reason: z.string().max(300),
});

export const weeklyAnalysisDataSchema = z.object({
  analysisId: z.number(),
  analysisType: analysisTypeSchema,
  analysisStatus: analysisStatusSchema,
  period: weeklyAnalysisPeriodSchema,
  summary: z.string().max(2000),
  mainEmotion: weeklyMainEmotionSchema,
  averageScore: z.number().min(1).max(10).nullable(),
  scoreTrend: scoreTrendSchema.nullable(),
  keyPatterns: z.array(weeklyKeyPatternSchema),
  triggers: z.array(weeklyTriggerSchema),
  recommendations: z.array(weeklyRecommendationSchema).max(3),
  safety: weeklySafetySchema,
  generatedAt: z.string(),
  modelName: z.string().max(100),
  recordedDays: z.number().int().min(0).max(7),
  comparison: weeklyComparisonSchema,
  dailyHighlights: z.array(weeklyDailyHighlightSchema).max(3),
});

/** POST /api/v1/ai-analyses/weekly response envelope */
export const createWeeklyAnalysisResponseSchema = z.object({
  success: z.boolean(),
  code: z.string().max(50),
  message: z.string().max(200),
  data: weeklyAnalysisDataSchema,
  requestId: z.string(),
});

export type CreateWeeklyAnalysisResponseType = z.infer<
  typeof createWeeklyAnalysisResponseSchema
>;

export type WeeklyAnalysisData = z.infer<
  typeof createWeeklyAnalysisResponseSchema
>["data"];

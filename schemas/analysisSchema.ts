import { z } from "zod";

function upperStringEnum<const T extends readonly [string, ...string[]]>(
  values: T,
  fallback: T[number]
) {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }
    return value.trim().toUpperCase();
  }, z.enum(values).catch(fallback));
}

export const analysisTypeSchema = upperStringEnum(
  ["DAILY", "WEEKLY", "MONTHLY"],
  "WEEKLY"
);

export const analysisStatusSchema = upperStringEnum(
  [
    "NONE",
    "REQUESTED",
    "PROCESSING",
    "READY",
    "SUCCESS",
    "FAILED",
    "INVALIDATED",
  ],
  "REQUESTED"
);

export const scoreTrendSchema = upperStringEnum(
  ["IMPROVING", "STABLE", "DECLINING", "INSUFFICIENT"],
  "INSUFFICIENT"
);

export const safetyRiskLevelSchema = upperStringEnum(
  ["NONE", "LOW", "MEDIUM", "HIGH"],
  "NONE"
);

/** AI-002 POST /api/v1/ai-analyses/weekly — response `data` payload */
export const weeklyAnalysisDataSchema = z.object({
  analysisId: z.number(),
  type: z.literal("WEEKLY"),
  status: z.enum([
    "NONE",
    "REQUESTED",
    "PROCESSING",
    "READY",
    "SUCCESS",
    "FAILED",
    "INVALIDATED",
  ]),
  title: z.string().optional().default(""),
  summary: z.string().optional().default(""),
  recordedDays: z.number().int().min(0).max(7).optional().default(0),
  keyPatterns: z.array(z.string()).optional().default([]),
  recommendations: z.array(z.string()).optional().default([]),
  dailyHighlights: z
    .array(
      z.object({
        date: z.string(),
        emotionCode: z.string(),
        reason: z.string(),
      })
    )
    .optional()
    .default([]),
});

/** POST /api/v1/ai-analyses/weekly response envelope */
export const createWeeklyAnalysisResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: weeklyAnalysisDataSchema.nullable(),
  requestId: z.string(),
});

export type CreateWeeklyAnalysisResponseType = z.infer<
  typeof createWeeklyAnalysisResponseSchema
>;

export type WeeklyAnalysisData = NonNullable<
  CreateWeeklyAnalysisResponseType["data"]
>;

export const analysisPeriodSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

export const mainEmotionSchema = z.object({
  code: z.string(),
  name: z.string(),
});

export const analysisKeyPatternSchema = z.object({
  patternCode: z.string(),
  title: z.string(),
  description: z.string(),
  confidence: z.number().nullable(),
});

export const analysisTriggerSchema = z.object({
  tagCode: z.string(),
  tagName: z.string(),
  count: z.number().int(),
});

export const analysisRecommendationSchema = z.object({
  recommendationId: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.number().int().min(1).max(5),
});

export const analysisSafetySchema = z.object({
  riskLevel: safetyRiskLevelSchema,
  showHelpGuide: z.boolean(),
});

export const dailyAnalysisDataSchema = z.object({
  analysisId: z.number().int(),
  analysisType: analysisTypeSchema,
  analysisStatus: analysisStatusSchema,
  period: analysisPeriodSchema,
  summary: z.string(),
  mainEmotion: mainEmotionSchema.nullable(),
  averageScore: z.number().nullable(),
  scoreTrend: scoreTrendSchema.nullable(),
  keyPatterns: z.array(analysisKeyPatternSchema),
  triggers: z.array(analysisTriggerSchema),
  recommendations: z.array(analysisRecommendationSchema).max(5),
  safety: analysisSafetySchema,
  generatedAt: z.string(),
  modelName: z.string(),
  diaryId: z.number().int(),
  dailyReflection: z.string(),
  recentContextDays: z.number().int().min(0).max(7),
});

export const createDailyAnalysisResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: dailyAnalysisDataSchema,
  requestId: z.string(),
});

export type CreateDailyAnalysisResponseType = z.infer<
  typeof createDailyAnalysisResponseSchema
>;

export type DailyAnalysisData = z.infer<
  typeof createDailyAnalysisResponseSchema
>["data"];

export const analysisJobStatusSchema = z.enum([
  "STARTED",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export const createWeeklyAnalysisJobResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: z.object({
    jobExecutionId: z.number().int(),
    jobStatus: analysisJobStatusSchema,
    baseDate: z.string().optional(),
  }),
  requestId: z.string(),
});

export type CreateWeeklyAnalysisJobResponse = z.infer<
  typeof createWeeklyAnalysisJobResponseSchema
>;
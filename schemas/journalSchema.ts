import { EMOTION_CODES } from "@/types/emotionType";
import { MOOD_IDS } from "@/types/moodType";
import { z } from "zod";

export const journalInputModeSchema = z.enum(["text", "voice"]);

export const emotionCodeSchema = z.enum(EMOTION_CODES);

export const analysisStatusSchema = z.enum([
  "NONE",
  "REQUESTED",
  "PROCESSING",
  "READY",
  "SUCCESS",
  "FAILED",
  "INVALIDATED",
]);

export const createEmotionDiaryRequestSchema = z.object({
  emotionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  content: z.string().trim().min(1),
  emotionCode: emotionCodeSchema,
  tagIds: z.array(z.number().int().positive()).optional(),
  autoCreateDailyAnalysis: z.boolean().optional(),
});

export const createJournalRequestSchema = z.object({
  mood: z.enum(MOOD_IDS),
  content: z.string().trim().min(1),
  inputMode: journalInputModeSchema,
  tagIds: z.array(z.number().int().positive()).optional(),
});

/** PATCH /api/v1/emotion-diaries/{diaryId} */
export const updateEmotionDiaryRequestSchema = z
  .object({
    content: z.string().trim().min(1).optional(),
    emotionCode: emotionCodeSchema.optional(),
    title: z.string().nullable().optional(),
    memo: z.string().nullable().optional(),
    sleepHours: z.number().nullable().optional(),
    weatherCode: z.string().nullable().optional(),
    tagIds: z.array(z.number().int().positive()).optional(),
  })
  .refine(
    (value) =>
      value.content !== undefined ||
      value.emotionCode !== undefined ||
      value.title !== undefined ||
      value.memo !== undefined ||
      value.sleepHours !== undefined ||
      value.weatherCode !== undefined ||
      value.tagIds !== undefined,
    { message: "At least one field is required for update." }
  );

export const emotionDiaryTagSchema = z.object({
  tagId: z.number().int().positive(),
  tagCode: z.string(),
  tagName: z.string(),
});

export const aiAnalysisPatternSchema = z.object({
  patternCode: z.string().optional().default(""),
  title: z.string(),
  description: z.string(),
  confidence: z.number().optional(),
});

export const aiAnalysisTriggerSchema = z.object({
  triggerCode: z.string().optional().default(""),
  title: z.string(),
  description: z.string(),
  confidence: z.number().optional(),
});

export const aiAnalysisRecommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
  priority: z.number().optional(),
});

export const aiAnalysisSafetySchema = z.object({
  riskLevel: z.string().optional().default("NONE"),
  showHelpGuide: z.boolean().optional().default(false),
});

export const diaryAiAnalysisSchema = z.object({
  analysisId: z.number().int().optional(),
  diaryId: z.number().int().optional(),
  analysisType: z.string().optional().default("DAILY"),
  analysisStatus: analysisStatusSchema.optional().default("NONE"),
  periodStartDate: z.string().optional().default(""),
  periodEndDate: z.string().optional().default(""),
  languageCode: z.string().optional().default(""),
  summary: z.string().optional().default(""),
  mainEmotionCode: z.string().optional().default(""),
  mainEmotionName: z.string().optional().default(""),
  averageScore: z.number().nullable().optional(),
  scoreTrend: z.string().optional().default(""),
  dailyReflection: z.string().optional().default(""),
  recentContextDays: z.number().int().optional(),
  keyPatterns: z.array(aiAnalysisPatternSchema).optional().default([]),
  triggers: z.array(aiAnalysisTriggerSchema).optional().default([]),
  recommendations: z.array(aiAnalysisRecommendationSchema).optional().default([]),
  safety: aiAnalysisSafetySchema.nullable().optional(),
  generatedAt: z.string().optional().default(""),
});

/** EMO-001 / EMO-002 shared diary payload under `data`. */
export const emotionDiaryDataSchema = z
  .object({
    diaryId: z.number().int().positive(),
    emotionDate: z.string().optional().default(""),
    emotionCode: z.string().optional().default(""),
    emotionName: z.string().optional().default(""),
    emotionScore: z.number().nullable().optional(),
    title: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    /** EMO-003 list returns preview instead of full content */
    contentPreview: z.string().nullable().optional(),
    sleepHours: z.number().nullable().optional(),
    weatherCode: z.string().nullable().optional(),
    weatherName: z.string().nullable().optional(),
    memo: z.string().nullable().optional(),
    tags: z.array(emotionDiaryTagSchema).nullable().optional(),
    /** EMO-003 list may return tag names only */
    tagNames: z.array(z.string()).nullable().optional(),
    analysisStatus: analysisStatusSchema.optional().default("NONE"),
    aiAnalysis: diaryAiAnalysisSchema.nullable().optional(),
    version: z.number().int().optional(),
    createdAt: z.string().optional().default(""),
    updatedAt: z.string().optional().default(""),
  })
  .passthrough();

export const createJournalResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: emotionDiaryDataSchema,
  requestId: z.string().optional().default(""),
});

/** Alias: GET detail uses the same envelope as create. */
export const emotionDiaryResponseSchema = createJournalResponseSchema;

export const journalResultDataSchema = emotionDiaryDataSchema;

/**
 * EMO-004 GET /api/v1/emotion-diaries/by-date/{date}
 * Observed success payload:
 * {
 *   diaryId, emotionDate, emotionCode, emotionName, contentPreview,
 *   tagNames, aiAnalysisSummary, riskLevel, createdAt
 * }
 */
export const emotionDiaryByDateDataSchema = z
  .object({
    diaryId: z.number().int().optional().nullable(),
    emotionDate: z.string().optional().default(""),
    emotionCode: z.string().optional().default(""),
    emotionName: z.string().optional().default(""),
    emotionScore: z.number().nullable().optional(),
    title: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    contentPreview: z.string().nullable().optional(),
    sleepHours: z.number().nullable().optional(),
    weatherCode: z.string().nullable().optional(),
    weatherName: z.string().nullable().optional(),
    memo: z.string().nullable().optional(),
    tags: z.array(emotionDiaryTagSchema).nullable().optional().default([]),
    tagNames: z.array(z.string()).nullable().optional().default([]),
    analysisStatus: analysisStatusSchema.optional().default("NONE"),
    aiAnalysisSummary: z.string().nullable().optional(),
    riskLevel: z.string().nullable().optional(),
    version: z.number().int().optional(),
    createdAt: z.string().optional().default(""),
    updatedAt: z.string().optional().default(""),
    /** Some API docs include this; live responses may omit it. */
    exists: z.boolean().optional(),
  })
  .passthrough();

export const emotionDiaryByDateResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: emotionDiaryByDateDataSchema,
  requestId: z.string().optional().default(""),
});

/**
 * GET /api/v1/emotion-diaries?fromDate=&toDate=
 * Paginated list: data.content[]
 */
export const emotionDiariesListResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string(),
  data: z.object({
    content: z.array(emotionDiaryDataSchema),
  }).passthrough(),
  requestId: z.string().optional().default(""),
});

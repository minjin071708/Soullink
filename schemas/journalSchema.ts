import { EMOTION_CODES } from "@/types/emotionType";
import { MOOD_IDS } from "@/types/moodType";
import { z } from "zod";

export const journalInputModeSchema = z.enum(["text", "voice"]);

export const emotionCodeSchema = z.enum(EMOTION_CODES);

export const analysisStatusSchema = z.enum([
  "NONE",
  "READY",
  "SUCCESS",
  "FAILED",
  "INVALIDATED",
]);

export const createEmotionDiaryRequestSchema = z.object({
  emotionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  content: z.string().trim().min(1),
  emotionCode: emotionCodeSchema,
  autoCreateDailyAnalysis: z.boolean().optional(),
});

export const createJournalRequestSchema = z.object({
  mood: z.enum(MOOD_IDS),
  content: z.string().trim().min(1),
  inputMode: journalInputModeSchema,
});

export const emotionDiaryTagSchema = z.object({
  tagId: z.number().int().positive(),
  tagCode: z.string(),
  tagName: z.string(),
});

/** EMO-001 / EMO-002 shared diary payload under `data`. */
export const emotionDiaryDataSchema = z
  .object({
    diaryId: z.number().int().positive(),
    emotionDate: z.string().optional().default(""),
    emotionCode: z.string().optional().default(""),
    emotionName: z.string().optional().default(""),
    emotionScore: z.number().int().min(1).max(10).nullable().optional(),
    title: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    sleepHours: z.number().nullable().optional(),
    weatherCode: z.string().nullable().optional(),
    weatherName: z.string().nullable().optional(),
    memo: z.string().nullable().optional(),
    tags: z.array(emotionDiaryTagSchema).nullable().optional(),
    analysisStatus: analysisStatusSchema.optional().default("NONE"),
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
 * Observed success payload (exists field is often omitted by the API):
 * {
 *   diaryId, emotionDate, emotionCode, emotionName, content,
 *   tags, analysisStatus, version, createdAt, updatedAt
 * }
 */
export const emotionDiaryByDateDataSchema = z
  .object({
    diaryId: z.number().int().optional().nullable(),
    emotionDate: z.string().optional().default(""),
    emotionCode: z.string().optional().default(""),
    emotionName: z.string().optional().default(""),
    emotionScore: z.number().int().min(1).max(10).nullable().optional(),
    title: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    sleepHours: z.number().nullable().optional(),
    weatherCode: z.string().nullable().optional(),
    weatherName: z.string().nullable().optional(),
    memo: z.string().nullable().optional(),
    tags: z.array(emotionDiaryTagSchema).nullable().optional().default([]),
    analysisStatus: analysisStatusSchema.optional().default("NONE"),
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

import {
  createJournalResponseSchema,
  emotionDiaryDataSchema,
  emotionDiariesListResponseSchema,
  updateEmotionDiaryRequestSchema,
} from "@/schemas/journalSchema";
import type { MoodId } from "@/types/moodType";
import { z } from "zod";

export type JournalInputMode = "text" | "voice";

export type CreateJournalRequestType = {
  mood: MoodId;
  content: string;
  inputMode: JournalInputMode;
  /** Optional EMO-007 cause tag IDs */
  tagIds?: number[];
};

export type UpdateEmotionDiaryRequestType = z.infer<
  typeof updateEmotionDiaryRequestSchema
>;

export type EmotionDiaryData = z.infer<typeof emotionDiaryDataSchema>;

export type AnalysisStatus = NonNullable<EmotionDiaryData["analysisStatus"]>;

/**
 * Normalized EMO-004 by-date diary payload.
 * Live API may omit `exists`; fetchJournalByDateApi always sets it.
 */
export type EmotionDiaryByDateData = {
  diaryId: number;
  exists: boolean;
  emotionDate: string;
  emotionCode: string;
  emotionName: string;
  emotionScore?: number | null;
  title?: string | null;
  content?: string | null;
  contentPreview?: string | null;
  sleepHours?: number | null;
  weatherCode?: string | null;
  weatherName?: string | null;
  memo?: string | null;
  tags?: Array<{
    tagId: number;
    tagCode: string;
    tagName: string;
  }> | null;
  tagNames?: string[] | null;
  analysisStatus?: AnalysisStatus;
  aiAnalysisSummary?: string | null;
  riskLevel?: string | null;
  version?: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateJournalResponseType = z.infer<
  typeof createJournalResponseSchema
>;

/** GET /api/v1/emotion-diaries/{diaryId} returns the diary `data` object. */
export type JournalResultDataType = EmotionDiaryData;

/** GET /api/v1/emotion-diaries?fromDate=&toDate= list items. */
export type EmotionDiariesListItem = EmotionDiaryData;

export type EmotionDiariesListResponseType = z.infer<
  typeof emotionDiariesListResponseSchema
>;

import { MOOD_TO_EMOTION_CODE } from "@/constants/moodEmotionMap";
import {
  createJournalResponseSchema,
  emotionDiaryByDateResponseSchema,
  emotionDiaryResponseSchema,
} from "@/schemas/journalSchema";
import type {
  CreateJournalRequestType,
  CreateJournalResponseType,
  EmotionDiaryByDateData,
  JournalResultDataType,
} from "@/types/journalType";
import { formatEmotionDate } from "@/utils/emotionDate";
import axiosInstance from "./axiosInstance";

/**
 * EMO-001 POST /api/v1/emotion-diaries
 * Returns the full API envelope; callers use `response.data.diaryId`.
 */
export const createJournalApi = async (
  payload: CreateJournalRequestType
): Promise<CreateJournalResponseType> => {
  const response = await axiosInstance.post(
    "api/v1/emotion-diaries",
    {
      emotionDate: formatEmotionDate(),
      content: payload.content,
      emotionCode: MOOD_TO_EMOTION_CODE[payload.mood],
      autoCreateDailyAnalysis: true,
    }
  );

  return createJournalResponseSchema.parse(response.data);
};

/**
 * EMO-002 GET /api/v1/emotion-diaries/{diaryId}
 * Returns the diary `data` object for the result screen.
 */
export const fetchJournalResultApi = async (
  diaryId: number
): Promise<JournalResultDataType> => {
  const response = await axiosInstance.get(
    `api/v1/emotion-diaries/${diaryId}`
  );

  const parsed = emotionDiaryResponseSchema.parse(response.data);
  return parsed.data;
};

/**
 * EMO-004 GET /api/v1/emotion-diaries/by-date/{date}
 * Returns diary data for a calendar date (yyyy-MM-dd).
 * Live API may omit `exists`; derive it from a positive diaryId.
 */
export const fetchJournalByDateApi = async (
  date: string
): Promise<EmotionDiaryByDateData> => {
  const response = await axiosInstance.get(
    `api/v1/emotion-diaries/by-date/${date}`
  );

  const parsed = emotionDiaryByDateResponseSchema.parse(response.data);
  const diaryId = parsed.data.diaryId ?? 0;
  const exists = parsed.data.exists ?? diaryId > 0;

  return {
    diaryId,
    exists,
    emotionDate: parsed.data.emotionDate,
    emotionCode: parsed.data.emotionCode,
    emotionName: parsed.data.emotionName,
    emotionScore: parsed.data.emotionScore,
    title: parsed.data.title,
    content: parsed.data.content,
    sleepHours: parsed.data.sleepHours,
    weatherCode: parsed.data.weatherCode,
    weatherName: parsed.data.weatherName,
    memo: parsed.data.memo,
    tags: parsed.data.tags,
    analysisStatus: parsed.data.analysisStatus,
    version: parsed.data.version,
    createdAt: parsed.data.createdAt,
    updatedAt: parsed.data.updatedAt,
  };
};

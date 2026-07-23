import {
  createJournalResponseSchema,
  emotionDiariesListResponseSchema,
  emotionDiaryByDateResponseSchema,
  emotionDiaryResponseSchema,
  updateEmotionDiaryRequestSchema,
} from "@/schemas/journalSchema";
import type {
  CreateJournalRequestType,
  CreateJournalResponseType,
  EmotionDiariesListItem,
  EmotionDiaryByDateData,
  JournalResultDataType,
  UpdateEmotionDiaryRequestType,
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
      emotionCode: payload.mood,
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
 * PATCH /api/v1/emotion-diaries/{diaryId}
 * Updates diary fields and returns the diary `data` object.
 */
export const updateEmotionDiaryApi = async (params: {
  diaryId: number;
  payload: UpdateEmotionDiaryRequestType;
}): Promise<JournalResultDataType> => {
  const body = updateEmotionDiaryRequestSchema.parse(params.payload);
  const response = await axiosInstance.patch(
    `api/v1/emotion-diaries/${params.diaryId}`,
    body
  );

  const parsed = emotionDiaryResponseSchema.parse(response.data);
  return parsed.data;
};

/**
 * GET /api/v1/emotion-diaries?fromDate=&toDate=
 * Returns diary list items from the paginated `data.content` array.
 */
export const fetchEmotionDiariesByRangeApi = async (params: {
  fromDate: string;
  toDate: string;
}): Promise<EmotionDiariesListItem[]> => {
  const response = await axiosInstance.get("api/v1/emotion-diaries", {
    params: {
      fromDate: params.fromDate,
      toDate: params.toDate,
      page: 0,
      size: 31,
    },
  });

  const parsed = emotionDiariesListResponseSchema.parse(response.data);
  return parsed.data.content;
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
    contentPreview: parsed.data.contentPreview,
    sleepHours: parsed.data.sleepHours,
    weatherCode: parsed.data.weatherCode,
    weatherName: parsed.data.weatherName,
    memo: parsed.data.memo,
    tags: parsed.data.tags,
    tagNames: parsed.data.tagNames,
    analysisStatus: parsed.data.analysisStatus,
    aiAnalysisSummary: parsed.data.aiAnalysisSummary,
    riskLevel: parsed.data.riskLevel,
    version: parsed.data.version,
    createdAt: parsed.data.createdAt,
    updatedAt: parsed.data.updatedAt,
  };
};

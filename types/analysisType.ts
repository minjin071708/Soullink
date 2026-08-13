export type {
  CreateDailyAnalysisResponseType,
  CreateWeeklyAnalysisJobResponse,
  CreateWeeklyAnalysisResponseType,
  DailyAnalysisData,
  WeeklyAnalysisData,
} from "../schemas/analysisSchema";

/**
 * POST /api/v1/ai-analyses/weekly request body.
 * `baseDate` is yyyy-MM-dd (end of the 7-day period), not a Date object.
 */
export type CreateWeeklyAnalysisRequestType = {
  baseDate?: string;
  forceRegenerate?: boolean;
};

export type CreateWeeklyAnalysisRequest = CreateWeeklyAnalysisRequestType;

export type CreateDailyAnalysisRequestType = {
  /** Analysis хийх diary ID */
  diaryId: number;
  /** Өмнөх 7 хоногийн diary context-ийг хамруулах эсэх */
  includeRecentContext?: boolean;
  /** Өмнө үүссэн analysis байсан ч дахин үүсгэх эсэх */
  forceRegenerate?: boolean;
};

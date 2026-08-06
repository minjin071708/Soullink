export type {
  CreateWeeklyAnalysisResponseType,
  WeeklyAnalysisData,
} from "../schemas/analysisSchema";

/**
 * POST /api/v1/ai-analyses/weekly request body.
 * `baseDate` is yyyy-MM-dd (end of the 7-day period), not a Date object.
 */
export type CreateWeeklyAnalysisRequestType = {
  baseDate: string;
  forceRegenerate?: boolean;
};

import { EMOTION_CHART_COLORS } from "@/features/insights/constants/insights.constants";
import type {
  InsightEmotionKey,
  InsightEmotionShare,
  InsightObservation,
  PreviousReport,
  WeeklyInsightCardModel,
} from "@/features/insights/types/insights.types";
import type {
  EmotionDistribution,
  EmotionTopTag,
  MonthlyStatisticsData,
  RecentReport,
  WeeklyReportDetailData,
  WeeklyStatisticsData,
} from "@/types/emotionStatisticsType";
import type { TFunction } from "i18next";

export type InsightCardViewModel = WeeklyInsightCardModel;

function toEmotionKey(code: string): InsightEmotionKey {
  const upper = code.trim().toUpperCase();

  if (upper in EMOTION_CHART_COLORS) {
    return upper as InsightEmotionKey;
  }

  if (upper === "NORMAL" || upper === "TIRED" || upper === "GOOD") {
    return "NEUTRAL";
  }

  return "NEUTRAL";
}

export function formatStatisticsDateRangeLabel(
  startDate: string,
  endDate: string,
  t: TFunction
): string {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return `${startDate} – ${endDate}`;
  }

  const startMonth = start.getMonth() + 1;
  const endMonth = end.getMonth() + 1;
  const startDay = start.getDate();
  const endDay = end.getDate();

  if (startMonth === endMonth) {
    return t("insights.dateRange.sameMonth", {
      month: startMonth,
      startDay,
      endDay,
    });
  }

  return t("insights.dateRange.crossMonth", {
    startMonth,
    startDay,
    endMonth,
    endDay,
  });
}

function mapEmotionShares(
  distribution: EmotionDistribution[]
): InsightEmotionShare[] {
  return distribution.map((item) => {
    const key = toEmotionKey(item.emotionCode);
    return {
      key,
      label: item.emotionName,
      count: item.count,
      color: EMOTION_CHART_COLORS[key],
    };
  });
}

function findTopEmotion(
  distribution: EmotionDistribution[]
): EmotionDistribution | undefined {
  if (distribution.length === 0) {
    return undefined;
  }

  return distribution.reduce((best, item) =>
    item.count > best.count ? item : best
  );
}

function buildWeeklyHeadline(
  data: Pick<WeeklyStatisticsData, "dominantEmotion" | "recordedDays">,
  t: TFunction
): string {
  if (data.dominantEmotion?.name) {
    return t("insights.weekly.headlineDominant", {
      emotion: data.dominantEmotion.name.toLowerCase(),
    });
  }

  if (data.recordedDays === 0) {
    return t("insights.weekly.headlineEmpty");
  }

  return t("insights.weekly.headlineFallback");
}

function buildMonthlyHeadline(
  data: MonthlyStatisticsData,
  t: TFunction
): string {
  const top = findTopEmotion(data.emotionDistribution);
  if (top) {
    return t("insights.monthly.headlineDominant", {
      emotion: top.emotionName.toLowerCase(),
    });
  }

  if (data.recordedDays === 0) {
    return t("insights.monthly.headlineEmpty");
  }

  return t("insights.monthly.headlineFallback");
}

/**
 * Maps weekly emotion-statistics API data into the Insights card view model.
 */
export function mapWeeklyEmotionStatisticsToCard(
  data: WeeklyStatisticsData | WeeklyReportDetailData,
  t: TFunction
): WeeklyInsightCardModel {
  const emotionShares = mapEmotionShares(data.emotionDistribution);
  const dominantShare = data.dominantEmotion
    ? data.emotionDistribution.find(
        (item) =>
          item.emotionCode.toUpperCase() ===
          data.dominantEmotion!.code.toUpperCase()
      )
    : undefined;

  const dominantColor = data.dominantEmotion
    ? EMOTION_CHART_COLORS[toEmotionKey(data.dominantEmotion.code)]
    : EMOTION_CHART_COLORS.NEUTRAL;

  return {
    periodLabel: t("insights.weekly.periodLabel"),
    dateRangeLabel: formatStatisticsDateRangeLabel(
      data.period.startDate,
      data.period.endDate,
      t
    ),
    headline: buildWeeklyHeadline(data, t),
    recordedDays: data.recordedDays,
    totalRecordedDays: data.totalRecordedDays,
    totalDays: data.recordedDays,
    journalCount: data.totalRecordedDays,
    dominantEmotion: {
      label: data.dominantEmotion?.name ?? "—",
      daysLabel:
        dominantShare != null
          ? t("insights.weekly.daysCount", { count: dominantShare.count })
          : t("insights.weekly.daysCount", { count: data.recordedDays }),
      color: dominantColor,
    },
    emotionShares,
    aiObservation:
      data.aiInsight?.content?.trim() || t("insights.aiObservationEmpty"),
    observations: mapTopTagsToObservations(data.topTags, t),
    previousReports: mapRecentReportsToPreviousReports(
      data.recentReports,
      t
    ),
  };
}

/**
 * Maps monthly emotion-statistics API data into the Insights card view model.
 */
export function mapMonthlyEmotionStatisticsToCard(
  data: MonthlyStatisticsData,
  t: TFunction
): WeeklyInsightCardModel {
  const emotionShares = mapEmotionShares(data.emotionDistribution);
  const topEmotion = findTopEmotion(data.emotionDistribution);
  const topColor = topEmotion
    ? EMOTION_CHART_COLORS[toEmotionKey(topEmotion.emotionCode)]
    : EMOTION_CHART_COLORS.NEUTRAL;

  const start = new Date(`${data.period.startDate}T00:00:00`);
  const monthLabel = Number.isNaN(start.getTime())
    ? t("insights.monthly.periodLabel")
    : t("insights.monthly.periodLabelMonth", {
        month: start.getMonth() + 1,
      });

  return {
    periodLabel: monthLabel,
    dateRangeLabel: formatStatisticsDateRangeLabel(
      data.period.startDate,
      data.period.endDate,
      t
    ),
    headline: buildMonthlyHeadline(data, t),
    recordedDays: data.recordedDays,
    totalRecordedDays: data.recordedDays,
    totalDays: data.recordedDays,
    journalCount: data.recordedDays,
    dominantEmotion: {
      label: topEmotion?.emotionName ?? "—",
      daysLabel:
        topEmotion != null
          ? t("insights.weekly.daysCount", { count: topEmotion.count })
          : t("insights.monthly.recordRateLabel", {
              rate: Math.round(data.recordRate),
            }),
      color: topColor,
    },
    emotionShares,
    aiObservation:
      data.aiInsight?.content?.trim() || t("insights.aiObservationEmpty"),
    observations: mapTopTagsToObservations(data.topTags, t),
    previousReports: [],
  };
}

export function isEmotionTopTag(value: unknown): value is EmotionTopTag {
  if (typeof value !== "object" || value == null) {
    return false;
  }

  const tag = value as Record<string, unknown>;
  return (
    typeof tag.tagId === "number" &&
    typeof tag.tagName === "string" &&
    typeof tag.count === "number"
  );
}

export function mapTopTagsToObservations(
  topTags: unknown[] | EmotionTopTag[] | undefined,
  t: TFunction
): InsightObservation[] {
  if (!topTags?.length) {
    return [];
  }

  return (topTags.filter(isEmotionTopTag) as EmotionTopTag[])
    .slice(0, 2)
    .map((tag, index) => ({
      id: String(tag.tagId),
      title:
        index === 0
          ? t("insights.observation.recurring")
          : t("insights.observation.commonTag"),
      subtitle: `${tag.tagName} · ${tag.count}`,
      icon: (index === 0 ? "recurring" : "helpful") as "recurring" | "helpful",
      accent:
        index === 0
          ? EMOTION_CHART_COLORS.HAPPY
          : EMOTION_CHART_COLORS.SAD,
    }));
}

export function mapRecentReportsToPreviousReports(
  reports: RecentReport[],
  t: TFunction
): PreviousReport[] {
  return reports.map((report) => {
    const key = toEmotionKey(report.resultCode);
    return {
      id: String(report.analysisId),
      analysisId: report.analysisId,
      title: formatStatisticsDateRangeLabel(
        report.period.startDate,
        report.period.endDate,
        t
      ),
      moodLabel: report.resultName,
      moodColor: EMOTION_CHART_COLORS[key],
      icon: report.analysisType === "MONTHLY" ? "sun" : "cloud",
    };
  });
}

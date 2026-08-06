import { EMOTION_CHART_COLORS } from "@/features/insights/constants/insights.constants";
import type {
  InsightEmotionKey,
  InsightEmotionShare,
  WeeklyInsightMock,
} from "@/features/insights/types/insights.types";
import type {
  EmotionDistribution,
  MonthlyEmotionStatisticsData,
  WeeklyEmotionStatisticsData,
} from "@/types/emotionStatisticsType";

export type InsightCardViewModel = Pick<
  WeeklyInsightMock,
  | "periodLabel"
  | "dateRangeLabel"
  | "headline"
  | "totalDays"
  | "journalCount"
  | "dominantEmotion"
  | "emotionShares"
>;

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
  endDate: string
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
    return `${startMonth}-р сарын ${startDay}–${endDay}`;
  }

  return `${startMonth}/${startDay} – ${endMonth}/${endDay}`;
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

function sumDistributionCounts(distribution: EmotionDistribution[]): number {
  return distribution.reduce((sum, item) => sum + item.count, 0);
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

function buildWeeklyHeadline(data: WeeklyEmotionStatisticsData): string {
  if (data.dominantEmotion?.name) {
    return `Энэ долоо хоногт чи илүү ${data.dominantEmotion.name.toLowerCase()} байлаа`;
  }

  if (data.recordedDays === 0) {
    return "Энэ долоо хоногт тэмдэглэл хараахан байхгүй";
  }

  return "Энэ долоо хоногийн сэтгэл хөдлөлийн тойм";
}

function buildMonthlyHeadline(data: MonthlyEmotionStatisticsData): string {
  const top = findTopEmotion(data.emotionDistribution);
  if (top) {
    return `Энэ сар чи илүү ${top.emotionName.toLowerCase()} байлаа`;
  }

  if (data.recordedDays === 0) {
    return "Энэ сар тэмдэглэл хараахан байхгүй";
  }

  if (data.averageScore != null) {
    return `Энэ сарын дундаж оноо ${data.averageScore.toFixed(1)}`;
  }

  return "Энэ сарын сэтгэл хөдлөлийн тойм";
}

/**
 * Maps weekly emotion-statistics API data into the Insights card view model.
 */
export function mapWeeklyEmotionStatisticsToCard(
  data: WeeklyEmotionStatisticsData
): InsightCardViewModel {
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
    periodLabel: "7 хоногийн тайлан",
    dateRangeLabel: formatStatisticsDateRangeLabel(
      data.period.startDate,
      data.period.endDate
    ),
    headline: buildWeeklyHeadline(data),
    totalDays: data.recordedDays,
    journalCount: sumDistributionCounts(data.emotionDistribution),
    dominantEmotion: {
      label: data.dominantEmotion?.name ?? "—",
      daysLabel:
        dominantShare != null
          ? `${dominantShare.count} өдөр`
          : `${data.recordedDays} өдөр`,
      color: dominantColor,
    },
    emotionShares,
  };
}

/**
 * Maps monthly emotion-statistics API data into the Insights card view model.
 */
export function mapMonthlyEmotionStatisticsToCard(
  data: MonthlyEmotionStatisticsData
): InsightCardViewModel {
  const emotionShares = mapEmotionShares(data.emotionDistribution);
  const topEmotion = findTopEmotion(data.emotionDistribution);
  const topColor = topEmotion
    ? EMOTION_CHART_COLORS[toEmotionKey(topEmotion.emotionCode)]
    : EMOTION_CHART_COLORS.NEUTRAL;

  const start = new Date(`${data.period.startDate}T00:00:00`);
  const monthLabel = Number.isNaN(start.getTime())
    ? "Сарын тайлан"
    : `${start.getMonth() + 1}-р сарын тайлан`;

  return {
    periodLabel: monthLabel,
    dateRangeLabel: formatStatisticsDateRangeLabel(
      data.period.startDate,
      data.period.endDate
    ),
    headline: buildMonthlyHeadline(data),
    totalDays: data.recordedDays,
    journalCount: sumDistributionCounts(data.emotionDistribution),
    dominantEmotion: {
      label: topEmotion?.emotionName ?? "—",
      daysLabel:
        topEmotion != null
          ? `${topEmotion.count} өдөр`
          : `${Math.round(data.recordRate)}% бичилт`,
      color: topColor,
    },
    emotionShares,
  };
}

import { EMOTION_CHART_COLORS } from "@/features/insights/constants/insights.constants";
import type { WeeklyInsightMock } from "@/features/insights/types/insights.types";

/** Temporary mock until weekly insight API is connected. */
export const MOCK_WEEKLY_INSIGHT: WeeklyInsightMock = {
  periodLabel: "7 хоногийн тайлан",
  dateRangeLabel: "7-р сарын 13–19",
  headline: "Энэ долоо хоногт чи илүү тайван байлаа",
  totalDays: 7,
  journalCount: 5,
  dominantEmotion: {
    label: "Тайван",
    daysLabel: "4 өдөр",
    color: EMOTION_CHART_COLORS.CALM,
  },
  emotionShares: [
    {
      key: "CALM",
      label: "Тайван",
      count: 4,
      color: EMOTION_CHART_COLORS.CALM,
    },
    {
      key: "ANXIOUS",
      label: "Түгшүүр",
      count: 1,
      color: EMOTION_CHART_COLORS.ANXIOUS,
    },
    {
      key: "HAPPY",
      label: "Баяртай",
      count: 1,
      color: EMOTION_CHART_COLORS.HAPPY,
    },
    {
      key: "ANGRY",
      label: "Ууртай",
      count: 1,
      color: EMOTION_CHART_COLORS.ANGRY,
    },
    {
      key: "NEUTRAL",
      label: "Сайн унтсан",
      count: 0,
      color: EMOTION_CHART_COLORS.NEUTRAL,
    },
  ],
  aiObservation:
    "Ажилтай холбоотой өдрүүдэд түгшүүр нэмэгдсэн ч амралтын өдрүүдэд сэтгэл санаа тогтворжжээ.",
  observations: [
    {
      id: "recurring",
      title: "Давтагдсан мэдрэмж",
      subtitle: "Түгшүүр",
      icon: "recurring",
      accent: EMOTION_CHART_COLORS.HAPPY,
    },
    {
      id: "helpful",
      title: "Тус болсон зүйл",
      subtitle: "Сайн унтаж амрах",
      icon: "helpful",
      accent: EMOTION_CHART_COLORS.SAD,
    },
  ],
  previousReports: [
    {
      id: "prev-1",
      title: "7-р сарын 6–12",
      moodLabel: "Тайван",
      moodColor: EMOTION_CHART_COLORS.CALM,
      icon: "cloud",
    },
    {
      id: "prev-2",
      title: "6-р сарын тайлан",
      moodLabel: "Сайжирсан",
      moodColor: EMOTION_CHART_COLORS.SAD,
      icon: "sun",
    },
  ],
};

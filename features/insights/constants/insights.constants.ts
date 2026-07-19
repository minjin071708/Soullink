import type { InsightEmotionKey } from "@/features/insights/types/insights.types";

export const INSIGHT_COLORS = {
  background: "#F7F0F5",
  card: "#FFFFFF",
  title: "#2A2A4A",
  muted: "#8B8BA3",
  accent: "#F06292",
  accentSoft: "#FFE4EE",
  segmentTrack: "#EDE7F0",
  border: "#EFE7EE",
  calm: "#8ED8BC",
  happy: "#F58AC0",
  anxious: "#FFAD5C",
  angry: "#FF6F70",
  sad: "#9E9AEF",
  neutral: "#C9C7D8",
} as const;

export const EMOTION_CHART_COLORS: Record<InsightEmotionKey, string> = {
  CALM: INSIGHT_COLORS.calm,
  HAPPY: INSIGHT_COLORS.happy,
  ANXIOUS: INSIGHT_COLORS.anxious,
  ANGRY: INSIGHT_COLORS.angry,
  SAD: INSIGHT_COLORS.sad,
  NEUTRAL: INSIGHT_COLORS.neutral,
};

export const PERIOD_OPTIONS = [
  { key: "day" as const, label: "Өдөр" },
  { key: "week" as const, label: "7 хоног" },
  { key: "month" as const, label: "Сар" },
];

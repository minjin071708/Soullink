import type { InsightEmotionKey } from "@/features/insights/types/insights.types";

export const INSIGHT_COLORS = {
  // background: "#F4F1F8",
  background: "#f9f9fa",
  card: "#FFFFFF",
  title: "#2A2A4A",
  muted: "#8B8BA3",
  accent: "#F06292",
  accentSoft: "#FFE4EE",
  segmentTrack: "#EDE7F0",
  border: "#EFE7EE",
  calm: "#AEC5EB",
  happy: "#BDE4A7",
  anxious: "#E4D9FF",
  angry: "#9FBBCC",
  sad: "#EAB464",
  neutral: "#7388F2",
  apple_ink : "#1d1d1f",
  primary : "#8a6be8",
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
  { key: "day" as const },
  { key: "week" as const },
  { key: "month" as const },
];

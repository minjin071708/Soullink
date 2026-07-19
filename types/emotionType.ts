export const EMOTION_CODES = [
  "ANGRY",
  "ANXIOUS",
  "CALM",
  "HAPPY",
  "SAD",
  "TIRED",
  "NORMAL",
] as const;

export type EmotionCode = (typeof EMOTION_CODES)[number];

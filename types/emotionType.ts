/** Backend EMOTION_CODE common codes. */
export const EMOTION_CODES = [
  "ANGRY",
  "ANXIOUS",
  "CALM",
  "HAPPY",
  "SAD",
  "TIRED",
] as const;

export type EmotionCode = (typeof EMOTION_CODES)[number];

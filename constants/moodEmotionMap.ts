import type { EmotionCode } from "@/types/emotionType";
import type { MoodId } from "@/types/moodType";

/** Maps UI mood selection to backend emotionCode values. */
export const MOOD_TO_EMOTION_CODE: Record<MoodId, EmotionCode> = {
  Unhappy: "ANGRY",
  Sad: "SAD",
  Normal: "NORMAL",
  Good: "CALM",
  Happy: "HAPPY",
};

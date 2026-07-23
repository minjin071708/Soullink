import type { ImageSourcePropType } from "react-native";
import { EMOTION_CODES, type EmotionCode } from "@/types/emotionType";

export const MOOD_IDS = EMOTION_CODES;

export type MoodId = EmotionCode;

export type MoodItem = {
  id: MoodId;
  labelKey: `home.mood.${Lowercase<MoodId>}`;
  image: ImageSourcePropType;
};

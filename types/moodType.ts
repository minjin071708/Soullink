import type { ImageSourcePropType } from "react-native";

export const MOOD_IDS = [
  "Unhappy",
  "Sad",
  "Normal",
  "Good",
  "Happy",
] as const;

export type MoodId = (typeof MOOD_IDS)[number];

export type MoodItem = {
  id: MoodId;
  labelKey: `home.mood.${Lowercase<MoodId>}`;
  image: ImageSourcePropType;
};

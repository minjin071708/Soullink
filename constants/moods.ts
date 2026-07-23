import type { EmotionCode } from "@/types/emotionType";
import type { MoodItem } from "@/types/moodType";
import type { ImageSourcePropType } from "react-native";

export const MOODS: MoodItem[] = [
  {
    id: "ANGRY",
    labelKey: "home.mood.angry",
    image: require("@/assets/mascotImages/unhappy.png"),
  },
  {
    id: "ANXIOUS",
    labelKey: "home.mood.anxious",
    image: require("@/assets/mascotImages/sad.png"),
  },
  {
    id: "CALM",
    labelKey: "home.mood.calm",
    image: require("@/assets/mascotImages/normal.png"),
  },
  {
    id: "HAPPY",
    labelKey: "home.mood.happy",
    image: require("@/assets/mascotImages/happy.png"),
  },
  {
    id: "SAD",
    labelKey: "home.mood.sad",
    image: require("@/assets/mascotImages/sad.png"),
  },
  {
    id: "TIRED",
    labelKey: "home.mood.tired",
    image: require("@/assets/mascotImages/good.png"),
  },
];

export const MOOD_IMAGES: Record<EmotionCode, ImageSourcePropType> =
  Object.fromEntries(MOODS.map((mood) => [mood.id, mood.image])) as Record<
    EmotionCode,
    ImageSourcePropType
  >;

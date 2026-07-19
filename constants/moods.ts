import type { MoodItem } from "@/types/moodType";

export const MOODS: MoodItem[] = [
  {
    id: "Unhappy",
    labelKey: "home.mood.unhappy",
    image: require("@/assets/mascotImages/unhappy.png"),
  },
  {
    id: "Sad",
    labelKey: "home.mood.sad",
    image: require("@/assets/mascotImages/sad.png"),
  },
  {
    id: "Normal",
    labelKey: "home.mood.normal",
    image: require("@/assets/mascotImages/normal.png"),
  },
  {
    id: "Good",
    labelKey: "home.mood.good",
    image: require("@/assets/mascotImages/good.png"),
  },
  {
    id: "Happy",
    labelKey: "home.mood.happy",
    image: require("@/assets/mascotImages/happy.png"),
  },
];

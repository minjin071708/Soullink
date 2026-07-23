import type { MoodConfig, MoodType } from "@/features/calendar/types/calendar.types";

export const CALENDAR_COLORS = {
  background: "#F5F3FF",
  card: "#FFFFFF",
  title: "#2A2A6A",
  muted: "#8D93B8",
  primary: "#8A6BE8",
  selectedFill: "#F6E9F4",
  selectedBorder: "#E8B8D8",
  weekLabel: "#9AA0C3",
  disabledText: "#C8CCE0",
  border: "#ECEAF8",
  analysisCard: "#EFEEFF",
  adviceCard: "#EAF8F0",
} as const;

/** Monday-first week labels (Mongolian abbreviations from design). */
export const WEEKDAY_LABELS = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"] as const;

export const WEEKDAY_FULL_MN = [
  "Даваа",
  "Мягмар",
  "Лхагва",
  "Пүрэв",
  "Баасан",
  "Бямба",
  "Ням",
] as const;

export const MONTH_NAMES_MN = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
] as const;

export const MOOD_CONFIG = {
  bad: {
    label: "Муу",
    color: "#8A6BE8",
    image: require("@/assets/mascotImages/unhappy.png"),
  },
  sad: {
    label: "Гунигтай",
    color: "#5B8DEF",
    image: require("@/assets/mascotImages/sad.png"),
  },
  normal: {
    label: "Энгийн",
    color: "#7A82A8",
    image: require("@/assets/mascotImages/normal.png"),
  },
  good: {
    label: "Сайн",
    color: "#E6A23B",
    image: require("@/assets/mascotImages/good.png"),
  },
  happy: {
    label: "Баяртай",
    color: "#F0B429",
    image: require("@/assets/mascotImages/happy.png"),
  },
} satisfies Record<MoodType, MoodConfig>;

export const CALENDAR_MASCOT = require("@/assets/mascotImages/calendarMascot.png");

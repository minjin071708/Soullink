import { MOODS } from "@/constants/moods";
import { MOOD_IDS, type MoodId } from "@/types/moodType";

export function isMoodId(value: string): value is MoodId {
  return (MOOD_IDS as readonly string[]).includes(value);
}

export function parseMoodParam(
  value: string | string[] | undefined
): MoodId | undefined {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw || !isMoodId(raw)) {
    return undefined;
  }

  return raw;
}

export function getMoodItem(moodId: MoodId) {
  return MOODS.find((mood) => mood.id === moodId);
}

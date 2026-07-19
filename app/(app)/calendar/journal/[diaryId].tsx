import { JournalDetailScreen } from "@/features/calendar/components/JournalDetailScreen";
import { useLocalSearchParams } from "expo-router";

function parseDiaryId(value: string | string[] | undefined): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return undefined;
  }

  const diaryId = Number(raw);
  return Number.isInteger(diaryId) && diaryId > 0 ? diaryId : undefined;
}

export default function JournalDetailRoute() {
  const params = useLocalSearchParams<{ diaryId?: string | string[] }>();
  const diaryId = parseDiaryId(params.diaryId);

  return <JournalDetailScreen diaryId={diaryId} />;
}

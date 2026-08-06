import { HomeWeeklyJournalCard } from "@/components/home/HomeWeeklyJournalCard";
import {
  buildMockJournalMap,
  buildMockWeekDays,
  toIsoDate,
} from "@/components/home/weeklyJournalMock";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";

/** Home weekly section — mock state until API is connected. */
export function WeeklyMoodJourneyCard() {
  const router = useRouter();
  const todayIso = useMemo(() => toIsoDate(new Date()), []);

  const weekDays = useMemo(() => buildMockWeekDays(), []);
  const journalMap = useMemo(
    () => buildMockJournalMap(weekDays, todayIso),
    [todayIso, weekDays]
  );

  const [selectedDate, setSelectedDate] = useState(
    () => todayIso
  );

  const selectedJournal = journalMap[selectedDate] ?? null;

  return (
    <HomeWeeklyJournalCard
      selectedDate={selectedDate}
      weekDays={weekDays}
      selectedJournal={selectedJournal}
      onSelectDay={setSelectedDate}
      onViewCalendar={() =>
        router.push({
          pathname: "/calendar-tab",
        })
      }
    />
  );
}

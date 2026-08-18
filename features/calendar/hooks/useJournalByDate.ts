import { fetchJournalByDateApi } from "@/api/journalApi";
import { isValidDateString } from "@/features/calendar/utils/calendar.utils";
import { useCanFetchAuthenticatedData } from "@/hooks/useCanFetchAuthenticatedData";
import { useQuery } from "@tanstack/react-query";

export const journalByDateQueryKey = (date: string) =>
  ["emotion-diary", "by-date", date] as const;

export function useJournalByDate(selectedDate: string) {
  const isValidDate = isValidDateString(selectedDate);
  const canFetch = useCanFetchAuthenticatedData();

  return useQuery({
    queryKey: journalByDateQueryKey(selectedDate),
    queryFn: () => fetchJournalByDateApi(selectedDate),
    enabled: canFetch && isValidDate,
  });
}

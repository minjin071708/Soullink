import { WeeklyInsightCard } from "@/features/insights/components/WeeklyInsightCard";
import type { WeeklyInsightCardModel } from "@/features/insights/types/insights.types";

type MonthlyInsightCardProps = {
  data: WeeklyInsightCardModel;
};

export function MonthlyInsightCard({ data }: MonthlyInsightCardProps) {
  return (
    <WeeklyInsightCard data={data} metaKey="insights.monthly.metaLine" />
  );
}

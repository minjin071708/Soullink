import { INSIGHT_COLORS } from "@/features/insights/constants/insights.constants";
import { useCreateDailyAnalysis } from "@/hooks/analysis/useCreateDailyAnalysis";
import { useJournalByDate } from "@/features/calendar/hooks/useJournalByDate";
import type { DailyAnalysisData } from "@/types/analysisType";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

type DailyInsightCardProps = {
  baseDate: string;
};

function trendLabel(value: DailyAnalysisData["scoreTrend"]): string {
  switch (value) {
    case "IMPROVING":
      return "Сайжирч байна";
    case "STABLE":
      return "Тогтвортой";
    case "DECLINING":
      return "Буурч байна";
    case "INSUFFICIENT":
      return "Мэдээлэл дутуу";
    default:
      return "—";
  }
}

export function DailyInsightCard({ baseDate }: DailyInsightCardProps) {
  const { data: diary, isLoading: isDiaryLoading, isError: isDiaryError, refetch: refetchDiary } =
    useJournalByDate(baseDate);
  const { mutateAsync: createDailyAnalysis, isPending } = useCreateDailyAnalysis();
  const [analysis, setAnalysis] = useState<DailyAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestedDiaryIdRef = useRef<number | null>(null);

  const diaryId = diary?.diaryId ?? 0;
  const hasDiary = Boolean(diary?.exists && diaryId > 0);

  useEffect(() => {
    if (!hasDiary || isDiaryLoading) {
      return;
    }
    if (requestedDiaryIdRef.current === diaryId && analysis) {
      return;
    }

    requestedDiaryIdRef.current = diaryId;
    setError(null);
    setAnalysis(null);

    void createDailyAnalysis({
      diaryId,
      includeRecentContext: true,
      forceRegenerate: false,
    })
      .then((result) => {
        setAnalysis(result);
      })
      .catch(() => {
        setError("Өнөөдрийн AI анализ үүсгэж чадсангүй.");
      });
  }, [analysis, createDailyAnalysis, diaryId, hasDiary, isDiaryLoading]);

  const handleRetry = () => {
    if (!hasDiary) {
      void refetchDiary();
      return;
    }
    setError(null);
    void createDailyAnalysis({
      diaryId,
      includeRecentContext: true,
      forceRegenerate: true,
    })
      .then((result) => setAnalysis(result))
      .catch(() => setError("Өнөөдрийн AI анализ үүсгэж чадсангүй."));
  };

  if (isDiaryLoading || isPending) {
    return (
      <View style={styles.stateCard}>
        <ActivityIndicator color={INSIGHT_COLORS.accent} />
        <Text style={styles.stateText}>Өдрийн анализ ачаалж байна...</Text>
      </View>
    );
  }

  if (isDiaryError || error) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateText}>{error ?? "Өдрийн тэмдэглэл ачаалж чадсангүй"}</Text>
        <Pressable onPress={handleRetry} style={({ pressed }) => [styles.retry, pressed && styles.pressed]}>
          <Text style={styles.retryText}>Дахин оролдох</Text>
        </Pressable>
      </View>
    );
  }

  if (!hasDiary) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateText}>Өнөөдөр тэмдэглэл байхгүй байна.</Text>
        <Text style={styles.subtle}>Эхлээд өнөөдрийн тэмдэглэлээ бичээд дахин орж үзээрэй.</Text>
      </View>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="sparkles" size={18} color={INSIGHT_COLORS.accent} />
        </View>
        <View style={styles.headCopy}>
          <Text style={styles.periodLabel}>Өнөөдрийн AI анализ</Text>
          <Text style={styles.dateLabel}>{analysis.period.startDate}</Text>
        </View>
      </View>

      <Text style={styles.mainEmotion}>{analysis.mainEmotion?.name ?? "감정 분석"}</Text>
      <Text style={styles.summary}>{analysis.summary}</Text>

      <View style={styles.metricRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricTitle}>Оноо</Text>
          <Text style={styles.metricValue}>
            {analysis.averageScore != null ? analysis.averageScore.toFixed(1) : "—"}
          </Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricTitle}>Тренд</Text>
          <Text style={styles.metricValue}>{trendLabel(analysis.scoreTrend)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Reflection</Text>
        <Text style={styles.body}>{analysis.dailyReflection}</Text>
      </View>

      {analysis.recommendations.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Өнөөдрийн зөвлөмж</Text>
          {analysis.recommendations.slice(0, 3).map((item) => (
            <View key={item.recommendationId} style={styles.recommendationRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.recText}>{item.title}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: INSIGHT_COLORS.card,
    borderRadius: 28,
    padding: 18,
    shadowColor: "#2A2A4A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
  },
  headRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: INSIGHT_COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  headCopy: { flex: 1 },
  periodLabel: { fontSize: 14, fontWeight: "700", color: INSIGHT_COLORS.accent },
  dateLabel: { fontSize: 12, color: INSIGHT_COLORS.muted, marginTop: 2 },
  mainEmotion: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
    color: INSIGHT_COLORS.title,
    marginBottom: 6,
  },
  summary: { fontSize: 14, lineHeight: 20, color: INSIGHT_COLORS.title, marginBottom: 14 },
  metricRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  metricBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: INSIGHT_COLORS.border,
    borderRadius: 14,
    padding: 10,
    backgroundColor: "#FCFBFD",
  },
  metricTitle: { fontSize: 12, color: INSIGHT_COLORS.muted, marginBottom: 4 },
  metricValue: { fontSize: 16, fontWeight: "700", color: INSIGHT_COLORS.title },
  section: { marginTop: 4, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: INSIGHT_COLORS.title, marginBottom: 6 },
  body: { fontSize: 14, lineHeight: 20, color: INSIGHT_COLORS.title },
  recommendationRow: { flexDirection: "row", gap: 8, marginTop: 4, alignItems: "flex-start" },
  bullet: { color: INSIGHT_COLORS.accent, fontSize: 16, lineHeight: 20 },
  recText: { flex: 1, color: INSIGHT_COLORS.title, fontSize: 13, lineHeight: 19 },
  stateCard: {
    minHeight: 220,
    borderRadius: 28,
    backgroundColor: INSIGHT_COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  stateText: { fontSize: 14, fontWeight: "600", color: INSIGHT_COLORS.muted, textAlign: "center" },
  subtle: { fontSize: 12, color: INSIGHT_COLORS.muted, textAlign: "center" },
  retry: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: INSIGHT_COLORS.accentSoft,
  },
  retryText: { fontSize: 14, fontWeight: "700", color: INSIGHT_COLORS.accent },
  pressed: { opacity: 0.85 },
});

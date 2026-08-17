import { useJournalByDate } from "@/features/calendar/hooks/useJournalByDate";
import { useJournalDetail } from "@/features/calendar/hooks/useJournalDetail";
import { INSIGHT_COLORS } from "@/features/insights/constants/insights.constants";
import { useCreateDailyAnalysis } from "@/hooks/analysis/useCreateDailyAnalysis";
import type { EmotionDiaryData } from "@/types/journalType";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type DailyInsightCardProps = {
  baseDate: string;
};

type DiaryAiAnalysis = NonNullable<EmotionDiaryData["aiAnalysis"]>;

function isCompletedStatus(status: string | undefined): boolean {
  return status === "SUCCESS" || status === "READY";
}

function trendLabel(
  value: string | undefined,
  t: (key: string) => string
): string {
  switch ((value ?? "").toUpperCase()) {
    case "IMPROVED":
    case "IMPROVING":
      return t("insights.daily.trend.improved");
    case "STABLE":
      return t("insights.daily.trend.stable");
    case "WORSENED":
    case "DECLINING":
      return t("insights.daily.trend.worsened");
    case "INSUFFICIENT":
      return t("insights.daily.trend.insufficient");
    default:
      return "—";
  }
}

export function DailyInsightCard({ baseDate }: DailyInsightCardProps) {
  const { t } = useTranslation();
  const {
    data: diaryByDate,
    isLoading: isDiaryLoading,
    isError: isDiaryError,
    refetch: refetchDiary,
  } = useJournalByDate(baseDate);

  const diaryId =
    diaryByDate?.exists && diaryByDate.diaryId > 0
      ? diaryByDate.diaryId
      : undefined;
  const hasDiary = diaryId !== undefined;

  const detailQuery = useJournalDetail(diaryId);
  const { mutateAsync: createDailyAnalysis, isPending: isCreating } =
    useCreateDailyAnalysis();

  const [createError, setCreateError] = useState<string | null>(null);
  const requestedDiaryIdRef = useRef<number | null>(null);

  const detail = detailQuery.data;
  const analysis = detail?.aiAnalysis ?? null;
  const analysisStatus = analysis?.analysisStatus ?? detail?.analysisStatus;
  const hasCompletedAnalysis =
    Boolean(analysis) && isCompletedStatus(analysisStatus);
  const needsGeneration =
    hasDiary &&
    !detailQuery.isLoading &&
    !detailQuery.isError &&
    Boolean(detail) &&
    !hasCompletedAnalysis &&
    analysisStatus !== "FAILED" &&
    analysisStatus !== "INVALIDATED";

  const ensureAnalysis = useCallback(
    async (forceRegenerate: boolean) => {
      if (!diaryId) {
        return;
      }

      setCreateError(null);
      try {
        await createDailyAnalysis({
          diaryId,
          includeRecentContext: true,
          forceRegenerate,
        });
        await detailQuery.refetch();
      } catch {
        setCreateError(t("insights.daily.createError"));
      }
    },
    [createDailyAnalysis, detailQuery, diaryId, t]
  );

  useEffect(() => {
    if (!needsGeneration || !diaryId) {
      return;
    }
    if (requestedDiaryIdRef.current === diaryId) {
      return;
    }

    requestedDiaryIdRef.current = diaryId;
    void ensureAnalysis(false);
  }, [diaryId, ensureAnalysis, needsGeneration]);

  const handleRetry = () => {
    if (!hasDiary) {
      void refetchDiary();
      return;
    }

    if (detailQuery.isError) {
      void detailQuery.refetch();
      return;
    }

    requestedDiaryIdRef.current = null;
    void ensureAnalysis(true);
  };

  const isLoading =
    isDiaryLoading ||
    (hasDiary && detailQuery.isLoading) ||
    isCreating ||
    (needsGeneration && !createError && !analysis);

  if (isLoading) {
    return (
      <View style={styles.stateCard}>
        <ActivityIndicator color={INSIGHT_COLORS.accent} />
        <Text style={styles.stateText}>{t("insights.daily.loading")}</Text>
      </View>
    );
  }

  if (isDiaryError || detailQuery.isError || createError) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateText}>
          {createError ?? t("insights.daily.loadError")}
        </Text>
        <Pressable
          onPress={handleRetry}
          style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
        >
          <Text style={styles.retryText}>{t("insights.retry")}</Text>
        </Pressable>
      </View>
    );
  }

  if (!hasDiary) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateText}>{t("insights.daily.noDiary")}</Text>
        <Text style={styles.subtle}>{t("insights.daily.noDiaryHint")}</Text>
      </View>
    );
  }

  if (analysisStatus === "FAILED" || analysisStatus === "INVALIDATED") {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateText}>
          {analysisStatus === "INVALIDATED"
            ? t("insights.daily.invalidated")
            : t("insights.daily.failed")}
        </Text>
        <Pressable
          onPress={handleRetry}
          style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
        >
          <Text style={styles.retryText}>{t("insights.daily.regenerate")}</Text>
        </Pressable>
      </View>
    );
  }

  if (!analysis || !hasCompletedAnalysis) {
    return (
      <View style={styles.stateCard}>
        <Text style={styles.stateText}>{t("insights.daily.empty")}</Text>
        <Text style={styles.subtle}>{t("insights.daily.emptyHint")}</Text>
        <Pressable
          onPress={handleRetry}
          style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
        >
          <Text style={styles.retryText}>{t("insights.daily.regenerate")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <DailyInsightContent
      analysis={analysis}
      emotionScore={detail?.emotionScore}
      scoreLabel={trendLabel(analysis.scoreTrend, t)}
    />
  );
}

function DailyInsightContent({
  analysis,
  emotionScore,
  scoreLabel,
}: {
  analysis: DiaryAiAnalysis;
  emotionScore?: number | null;
  scoreLabel: string;
}) {
  const { t } = useTranslation();
  const title = analysis.title?.trim();
  const summary = analysis.summary?.trim();
  const reflection = analysis.dailyReflection?.trim();
  const emotionName =
    analysis.mainEmotionName?.trim() || t("insights.daily.emotionFallback");
  const recommendations = analysis.recommendations?.slice(0, 3) ?? [];

  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="sparkles" size={18} color={INSIGHT_COLORS.accent} />
        </View>
        <View style={styles.headCopy}>
          <Text style={styles.periodLabel}>{t("insights.daily.title")}</Text>
          <Text style={styles.dateLabel}>
            {analysis.periodStartDate || "—"}
          </Text>
        </View>
      </View>

      {title ? <Text style={styles.analysisTitle}>{title}</Text> : null}

      <Text style={styles.mainEmotion}>{emotionName}</Text>
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}

      <View style={styles.metricRow}>
        <View style={styles.metricBox}>
          <Text style={styles.metricTitle}>{t("insights.daily.score")}</Text>
          <Text style={styles.metricValue}>
            {emotionScore != null
              ? emotionScore.toFixed(1)
              : analysis.averageScore != null
                ? analysis.averageScore.toFixed(1)
                : "—"}
          </Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricTitle}>{t("insights.daily.trendLabel")}</Text>
          <Text style={styles.metricValue}>{scoreLabel}</Text>
        </View>
      </View>

      {reflection ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("insights.daily.reflection")}
          </Text>
          <Text style={styles.body}>{reflection}</Text>
        </View>
      ) : null}

      {recommendations.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("insights.daily.recommendations")}
          </Text>
          {recommendations.map((item, index) => (
            <View
              key={`${item.title}-${index}`}
              style={styles.recommendationRow}
            >
              <Text style={styles.bullet}>•</Text>
              <View style={styles.recCopy}>
                <Text style={styles.recText}>{item.title}</Text>
                {item.description?.trim() ? (
                  <Text style={styles.recDescription}>{item.description}</Text>
                ) : null}
              </View>
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
  periodLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: INSIGHT_COLORS.accent,
  },
  dateLabel: { fontSize: 12, color: INSIGHT_COLORS.muted, marginTop: 2 },
  analysisTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: INSIGHT_COLORS.title,
    marginBottom: 8,
  },
  mainEmotion: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "800",
    color: INSIGHT_COLORS.title,
    marginBottom: 6,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    color: INSIGHT_COLORS.title,
    marginBottom: 14,
  },
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: INSIGHT_COLORS.title,
    marginBottom: 6,
  },
  body: { fontSize: 14, lineHeight: 20, color: INSIGHT_COLORS.title },
  recommendationRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
    alignItems: "flex-start",
  },
  bullet: { color: INSIGHT_COLORS.accent, fontSize: 16, lineHeight: 20 },
  recCopy: { flex: 1, gap: 2 },
  recText: {
    color: INSIGHT_COLORS.title,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  recDescription: {
    color: INSIGHT_COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  stateCard: {
    minHeight: 220,
    borderRadius: 28,
    backgroundColor: INSIGHT_COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  stateText: {
    fontSize: 14,
    fontWeight: "600",
    color: INSIGHT_COLORS.muted,
    textAlign: "center",
  },
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

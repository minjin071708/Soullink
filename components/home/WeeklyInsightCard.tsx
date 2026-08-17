import { useCreateWeeklyAnalysis } from "@/hooks/analysis/useCreateWeeklyAnalysis";
import type { WeeklyAnalysisData } from "@/types/analysisType";
import { isApiTimeoutError } from "@/utils/apiError";
import { formatEmotionDate } from "@/utils/emotionDate";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const TEXT = "#302060";
const MUTED = "#706784";
const PRIMARY = "#8A6BE8";
const FOOTER_ICON = "#9B8DAF";

type Props = { forceRegenerate?: boolean };

export function WeeklyInsightCard({ forceRegenerate = false }: Props) {
  const { t } = useTranslation();
  const requestedRef = useRef(false);
  const baseDate = useMemo(() => formatEmotionDate(), []);
  const [timedOut, setTimedOut] = useState(false);
  const [genericError, setGenericError] = useState(false);
  const { mutateAsync, data, isPending, reset } = useCreateWeeklyAnalysis();

  const runAnalysis = useCallback(
    async (regenerate: boolean) => {
      setTimedOut(false);
      setGenericError(false);

      try {
        // POST /api/v1/ai-analyses/weekly
        await mutateAsync({ baseDate, forceRegenerate: regenerate });
      } catch (error) {
        if (isApiTimeoutError(error)) {
          setTimedOut(true);
          return;
        }
        setGenericError(true);
      }
    },
    [baseDate, mutateAsync]
  );

  useEffect(() => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    void runAnalysis(forceRegenerate);
  }, [forceRegenerate, runAnalysis]);

  const status = data?.status;
  const isCompleted = status === "READY" || status === "SUCCESS";
  const summary = data?.summary?.trim() ?? "";
  const title = data?.title?.trim() ?? "";

  const showLoading =
    isPending || status === "REQUESTED" || status === "PROCESSING";
  const showContent =
    !isPending && !timedOut && !genericError && isCompleted && Boolean(summary);
  const showFailed = !isPending && !timedOut && !genericError && status === "FAILED";
  const showInvalidated =
    !isPending && !timedOut && !genericError && status === "INVALIDATED";
  const showTimeout = timedOut && !isPending;
  const showGenericError = genericError && !isPending && !timedOut;
  const showEmpty =
    !showLoading &&
    !showContent &&
    !showFailed &&
    !showInvalidated &&
    !showTimeout &&
    !showGenericError;

  const retry = (regenerate: boolean) => {
    reset();
    void runAnalysis(regenerate);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.sparkleIcon}>
              <Ionicons name="sparkles" size={16} color={PRIMARY} />
            </View>
            <Text style={styles.headerTitle}>
              {t("home.weeklyInsight.title")}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {t("home.weeklyInsight.aiBadge")}
            </Text>
          </View>
        </View>

        <View style={styles.headerDivider} />

        {showLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={PRIMARY} />
            <Text style={styles.stateText}>
              {status === "PROCESSING"
                ? t("home.weeklyInsight.processing")
                : status === "REQUESTED"
                  ? t("home.weeklyInsight.requested")
                  : t("home.weeklyInsight.loading")}
            </Text>
          </View>
        ) : null}

        {showContent && data ? (
          <SuccessContent data={data} title={title} summary={summary} />
        ) : null}

        {showEmpty ? (
          <View style={styles.stateBox}>
            <Text style={styles.emptyTitle}>
              {t("home.weeklyInsight.emptyTitle")}
            </Text>
            <Text style={styles.stateText}>
              {t("home.weeklyInsight.emptyDescription")}
            </Text>
          </View>
        ) : null}

        {showTimeout ? (
          <ErrorState
            message={t("home.weeklyInsight.timeout")}
            label={t("home.weeklyInsight.regenerate")}
            onRetry={() => retry(true)}
          />
        ) : null}

        {showGenericError ? (
          <ErrorState
            message={t("home.weeklyInsight.error")}
            label={t("home.weeklyInsight.retry")}
            onRetry={() => retry(false)}
          />
        ) : null}

        {showFailed ? (
          <ErrorState
            message={t("home.weeklyInsight.failed")}
            label={t("home.weeklyInsight.regenerate")}
            onRetry={() => retry(true)}
          />
        ) : null}

        {showInvalidated ? (
          <ErrorState
            message={t("home.weeklyInsight.invalidated")}
            label={t("home.weeklyInsight.regenerate")}
            onRetry={() => retry(true)}
          />
        ) : null}
      </View>
    </View>
  );
}

function SuccessContent({
  data,
  title,
  summary,
}: {
  data: WeeklyAnalysisData;
  title: string;
  summary: string;
}) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View style={styles.content}>
      {title ? <Text style={styles.mainTitle}>{title}</Text> : null}
      <Text style={styles.summary}>{summary}</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("home.weeklyInsight.seeMore")}
        onPress={() => router.push("/insights")}
        style={({ pressed }) => [
          styles.seeMoreButton,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.seeMoreText}>
          {t("home.weeklyInsight.seeMore")}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={PRIMARY} />
      </Pressable>
    </View>
  );
}

function ErrorState({
  message,
  label,
  onRetry,
}: {
  message: string;
  label: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.stateBox}>
      <Text style={styles.stateText}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
      >
        <Text style={styles.retryText}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFCFD",
    borderColor: "rgba(168, 140, 230, 0.35)",
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    shadowColor: "#C8B6E8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  sparkleIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0EAFE",
  },
  headerTitle: {
    flex: 1,
    flexShrink: 1,
    color: TEXT,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(138, 107, 232, 0.12)",
  },
  badgeText: {
    color: PRIMARY,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(138, 107, 232, 0.18)",
    marginTop: 14,
    marginBottom: 16,
  },
  content: {
    gap: 12,
  },
  mainTitle: {
    color: "#302060",
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  summary: {
    color: "#706784",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
  },
  footerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  footerMetaText: {
    flex: 1,
    flexShrink: 1,
    color: MUTED,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  seeMoreButton: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "rgba(138, 107, 232, 0.10)",
  },
  seeMoreText: {
    color: PRIMARY,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  stateBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  stateText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  emptyTitle: {
    color: TEXT,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(138, 107, 232, 0.12)",
  },
  retryText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.84,
  },
});

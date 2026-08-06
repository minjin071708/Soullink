import { useCreateWeeklyAnalysis } from "@/hooks/analysis/useCreateWeeklyAnalysis";
import type { WeeklyAnalysisData } from "@/types/analysisType";
import { isApiTimeoutError } from "@/utils/apiError";
import { formatEmotionDate } from "@/utils/emotionDate";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
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

const MASCOT = require("@/assets/mascotImages/daymascot3d.png");

const TEXT = "#3D2A6B";
const MUTED = "#8B7BA8";
const PRIMARY = "#8A6BE8";
const CARD_BORDER = "rgba(168, 140, 230, 0.28)";

function splitSummary(summary: string): { headline: string; detail?: string } {
  const trimmed = summary.trim();
  const parts = trimmed.split(/\n+/).map((part) => part.trim()).filter(Boolean);

  if (parts.length >= 2) {
    return { headline: parts[0], detail: parts.slice(1).join(" ") };
  }

  const sentenceSplit = trimmed.match(/^(.+?[.!?。！？])\s+(.+)$/s);
  if (sentenceSplit) {
    return { headline: sentenceSplit[1], detail: sentenceSplit[2] };
  }

  return { headline: trimmed };
}

type WeeklyInsightCardProps = {
  /** Only pass true for an explicit user “regenerate” action. */
  forceRegenerate?: boolean;
};

export function WeeklyInsightCard({
  forceRegenerate = false,
}: WeeklyInsightCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const requestedRef = useRef(false);
  const baseDate = useMemo(() => formatEmotionDate(), []);
  const [timedOut, setTimedOut] = useState(false);
  const [genericError, setGenericError] = useState<string | null>(null);

  const {
    mutateAsync: createWeeklyAnalysis,
    data,
    isPending,
    reset,
  } = useCreateWeeklyAnalysis();

  const runAnalysis = useCallback(
    async (options: { forceRegenerate: boolean }) => {
      setTimedOut(false);
      setGenericError(null);

      try {
        await createWeeklyAnalysis({
          baseDate,
          forceRegenerate: options.forceRegenerate,
        });
      } catch (error) {
        if (isApiTimeoutError(error)) {
          // Client timeout ≠ backend FAILED. Do not auto-retry or flip forceRegenerate.
          setTimedOut(true);
          return;
        }

        setGenericError(
          error instanceof Error
            ? error.message
            : t("home.weeklyInsight.error")
        );
      }
    },
    [baseDate, createWeeklyAnalysis, t]
  );

  useEffect(() => {
    if (requestedRef.current) {
      return;
    }
    requestedRef.current = true;
    void runAnalysis({ forceRegenerate });
  }, [forceRegenerate, runAnalysis]);

  const recommendation = data?.recommendations?.[0];
  const summaryParts = data ? splitSummary(data.summary) : null;
  const status = data?.analysisStatus;

  const showLoading =
    isPending ||
    status === "REQUESTED" ||
    status === "PROCESSING";

  const showSuccessContent = !isPending && status === "SUCCESS";
  const showFailed = !isPending && status === "FAILED";
  const showInvalidated = !isPending && status === "INVALIDATED";
  const showTimeout = timedOut && !isPending && !data;
  const showGenericError =
    Boolean(genericError) && !isPending && !data && !timedOut;

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={["#FBF8FF", "#F3ECFF"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.card}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.sparkleIconWrap}>
              <Ionicons name="sparkles" size={16} color={PRIMARY} />
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {t("home.weeklyInsight.title")}
            </Text>
          </View>

          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>
              {t("home.weeklyInsight.aiBadge")}
            </Text>
          </View>
        </View>

        {showLoading && !showSuccessContent && !showTimeout && !showGenericError ? (
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

        {showTimeout ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>
              {t("home.weeklyInsight.timeout")}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                reset();
                void runAnalysis({ forceRegenerate: true });
              }}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.retryText}>
                {t("home.weeklyInsight.regenerate")}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {showGenericError ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>
              {genericError ?? t("home.weeklyInsight.error")}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                reset();
                void runAnalysis({ forceRegenerate: false });
              }}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.retryText}>
                {t("home.weeklyInsight.retry")}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {showFailed ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>
              {t("home.weeklyInsight.failed")}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                reset();
                void runAnalysis({ forceRegenerate: true });
              }}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.retryText}>
                {t("home.weeklyInsight.regenerate")}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {showInvalidated ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>
              {t("home.weeklyInsight.invalidated")}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                reset();
                void runAnalysis({ forceRegenerate: true });
              }}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.retryText}>
                {t("home.weeklyInsight.regenerate")}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {showSuccessContent && data ? (
          <WeeklyInsightContent
            data={data}
            headline={summaryParts?.headline ?? data.summary}
            detail={summaryParts?.detail}
            recommendationTitle={
              recommendation?.title ?? t("home.weeklyInsight.tryToday")
            }
            recommendationDescription={recommendation?.description}
            onViewInsights={() => router.push("/insights")}
          />
        ) : null}
      </LinearGradient>
    </View>
  );
}

type ContentProps = {
  data: WeeklyAnalysisData;
  headline: string;
  detail?: string;
  recommendationTitle: string;
  recommendationDescription?: string;
  onViewInsights: () => void;
};

function WeeklyInsightContent({
  data,
  headline,
  detail,
  recommendationTitle,
  recommendationDescription,
  onViewInsights,
}: ContentProps) {
  const { t } = useTranslation();

  return (
    <>
      <Text style={styles.summaryHeadline}>{headline}</Text>
      {detail ? <Text style={styles.summaryDetail}>{detail}</Text> : null}

      <View style={styles.recommendationWrap}>
        <View style={styles.recommendationCard}>
          <View style={styles.recommendationHeader}>
            <Ionicons name="heart" size={16} color="#E56B8A" />
            <Text style={styles.recommendationTitle} numberOfLines={2}>
              {recommendationTitle}
            </Text>
          </View>
          {recommendationDescription ? (
            <Text style={styles.recommendationBody}>
              {recommendationDescription}
            </Text>
          ) : null}
        </View>

        <Image
          source={MASCOT}
          style={styles.mascot}
          contentFit="contain"
          accessible={false}
        />
      </View>

      <View style={styles.footerDivider} />

      <View style={styles.footerRow}>
        <Text style={styles.footerMeta}>
          {t("home.weeklyInsight.basedOnDays", {
            count: data.recordedDays,
          })}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("home.weeklyInsight.viewInsights")}
          onPress={onViewInsights}
          style={({ pressed }) => [
            styles.viewInsightsButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.viewInsightsText}>
            {t("home.weeklyInsight.viewInsights")}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={TEXT} />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    overflow: "hidden",
    shadowColor: "#B9A4E8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sparkleIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(138, 107, 232, 0.14)",
  },
  headerTitle: {
    flex: 1,
    color: TEXT,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  aiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(138, 107, 232, 0.12)",
  },
  aiBadgeText: {
    color: PRIMARY,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "700",
  },
  stateBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 28,
  },
  stateText: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
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
  summaryHeadline: {
    color: TEXT,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  summaryDetail: {
    color: TEXT,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "500",
    opacity: 0.88,
    marginBottom: 14,
  },
  recommendationWrap: {
    position: "relative",
    marginBottom: 14,
    paddingRight: 56,
  },
  recommendationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(168, 140, 230, 0.18)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recommendationTitle: {
    flex: 1,
    color: TEXT,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  recommendationBody: {
    color: TEXT,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
  mascot: {
    position: "absolute",
    right: -8,
    bottom: -6,
    width: 88,
    height: 88,
  },
  footerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(138, 107, 232, 0.18)",
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  footerMeta: {
    flex: 1,
    color: MUTED,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  viewInsightsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewInsightsText: {
    color: TEXT,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.84,
  },
});

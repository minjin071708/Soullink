import { useWeeklyEmotionStatistics } from "@/hooks/insights/useWeeklyEmotionStatistics";
import { formatEmotionDate } from "@/utils/emotionDate";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

const COLORS = {
  text: "#2A2A6A",
  secondary: "#48484A",
  muted: "#6E6E8A",
  primary: "#7C63E6",
  primarySoft: "#F1EDFF",
  border: "rgba(60, 60, 67, 0.08)",
  divider: "rgba(60, 60, 67, 0.10)",
  button: "#7C63E6",
  white: "#FFFFFF",
};

export function WeeklyInsightCard() {
  const { t } = useTranslation();
  const router = useRouter();

  const baseDate = useMemo(() => formatEmotionDate(), []);
  const query = useWeeklyEmotionStatistics({ baseDate });

  const data = query.data;
  const insight = data?.aiInsight;

  const title = insight?.title?.trim() ?? "";
  const summary = insight?.content?.trim() ?? "";

  const hasInsight =
    insight?.status === "SUCCESS" && Boolean(title || summary);

  const recordedDays = data?.recordedDays ?? 0;
  const dominantEmotion = data?.dominantEmotion?.name ?? "—";

  const recordRate = Math.min(
    Math.round((recordedDays / 7) * 100),
    100,
  );

  const periodLabel = useMemo(() => {
    if (!data?.period) return "";

    const start = data.period.startDate.slice(5).replace("-", ".");
    const end = data.period.endDate.slice(5).replace("-", ".");

    return `${start} – ${end}`;
  }, [data?.period]);

  const openInsights = () => {
    router.push("/insights");
  };

  return (
    <View style={styles.wrapper}>
      <View>
   
          <View pointerEvents="none" />
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Ionicons
              name="sparkles"
              size={15}
              color={COLORS.primary}
            />

            <Text style={styles.badgeText}>
              {t("home.weeklyInsight.badge")}
            </Text>
          </View>

          {periodLabel ? (
            <Text style={styles.period}>{periodLabel}</Text>
          ) : null}
        </View>

        {query.isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
            />

            <Text style={styles.stateText}>
              {t("home.weeklyInsight.loading")}
            </Text>
          </View>
        ) : null}

        {query.isError ? (
          <View style={styles.stateContainer}>
            <View style={styles.stateIcon}>
              <Ionicons
                name="cloud-offline-outline"
                size={22}
                color={COLORS.muted}
              />
            </View>

            <Text style={styles.stateTitle}>
              {t("home.weeklyInsight.error")}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => void query.refetch()}
              hitSlop={8}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.retryLabel}>
                {t("home.weeklyInsight.retry")}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!query.isLoading && !query.isError ? (
          <>
            <View style={styles.insightContent}>
              {/* <Text style={styles.eyebrow}>
                {t("home.weeklyInsight.title")}
              </Text> */}

              <Text style={styles.mainTitle}>
                {hasInsight
                  ? title
                  : t("home.weeklyInsight.insufficientTitle")}
              </Text>

              <Text style={styles.summary} numberOfLines={4}>
                {hasInsight
                  ? summary
                  : t(
                      "home.weeklyInsight.insufficientDescription",
                    )}
              </Text>
            </View>

            <View style={styles.statsContainer}>
              <StatItem
                value={String(recordedDays)}
                label={t("home.weeklyInsight.recordedDays")}
              />

              <View style={styles.divider} />

              <StatItem
                value={dominantEmotion}
                label={t("home.weeklyInsight.mainEmotion")}
              />

              <View style={styles.divider} />

              <StatItem
                value={`${recordRate}%`}
                label={t("home.weeklyInsight.recordRate")}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(
                "home.weeklyInsight.viewReport",
              )}
              onPress={openInsights}
              style={({ pressed }) => [
                styles.reportButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.reportButtonLabel}>
                {t("home.weeklyInsight.viewReport")}
              </Text>

              <Ionicons
                name="arrow-forward"
                size={17}
                color={COLORS.white}
              />
  
            </Pressable>
          </>
        ) : null}
      </View>
    </View>
  );
}

type StatItemProps = {
  value: string;
  label: string;
};

function StatItem({ value, label }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>

      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 4,
    marginBottom: 24,
    backgroundColor: "#ffffff",
    padding: 22,
    borderRadius: 24,
  },


  card: {
    overflow: "hidden",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    backgroundColor: "#ffffff",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 22,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  badgeText: {
    color: COLORS.primary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
    letterSpacing: -0.1,
  },

  period: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },

  insightContent: {
    alignItems: "center",
    paddingHorizontal: 2,
  },

  eyebrow: {
    marginBottom: 8,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    letterSpacing: 0.1,
  },

  mainTitle: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 30,
    fontWeight: "700",
  },

  summary: {
    marginTop: 10,
    color: COLORS.secondary,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400",
    textAlign: "center",
  },

  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: "#F8F8FA",
    borderRadius: 18,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 6,
  },

  statValue: {
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  statLabel: {
    marginTop: 3,
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "500",
  },

  divider: {
    width: StyleSheet.hairlineWidth,
    height: 30,
    backgroundColor: COLORS.divider,
  },

  reportButton: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.button,
    borderRadius: 99,
  },

  reportButtonLabel: {
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
    letterSpacing: -0.1,
  },

  stateContainer: {
    minHeight: 210,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  stateIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    backgroundColor: "#F2F2F7",
    borderRadius: 23,
  },

  stateTitle: {
    color: COLORS.secondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },

  stateText: {
    marginTop: 10,
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
  },

  retryButton: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  retryLabel: {
    color: COLORS.primary,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },

  pressed: {
    opacity: 0.65,
  },

  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
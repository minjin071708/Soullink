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
  View,
} from "react-native";

const TEXT = "#302060";
const MUTED = "#706784";
const PRIMARY = "#8A6BE8";

export function WeeklyInsightCard() {
  const { t } = useTranslation();
  const router = useRouter();
  const baseDate = useMemo(() => formatEmotionDate(), []);
  const query = useWeeklyEmotionStatistics({ baseDate });

  const title = query.data?.aiInsight?.title?.trim() ?? "";
  const summary = query.data?.aiInsight?.content?.trim() ?? "";
  const hasContent = Boolean(title || summary);

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

        {query.isLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={PRIMARY} />
            <Text style={styles.stateText}>
              {t("home.weeklyInsight.loading")}
            </Text>
          </View>
        ) : null}

        {query.isError ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>
              {t("home.weeklyInsight.error")}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void query.refetch();
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

        {!query.isLoading && !query.isError && hasContent ? (
          <View style={styles.content}>
            {title ? <Text style={styles.mainTitle}>{title}</Text> : null}
            {summary ? <Text style={styles.summary}>{summary}</Text> : null}

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
        ) : null}

        {!query.isLoading && !query.isError && !hasContent ? (
          <View style={styles.stateBox}>
            <Text style={styles.emptyTitle}>
              {t("home.weeklyInsight.insufficientTitle")}
            </Text>
            <Text style={styles.stateText}>
              {t("home.weeklyInsight.insufficientDescription")}
            </Text>
          </View>
        ) : null}
      </View>
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

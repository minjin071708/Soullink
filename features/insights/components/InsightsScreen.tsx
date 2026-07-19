import { MOCK_WEEKLY_INSIGHT } from "@/features/insights/api/insightsMock";
import {
  AiObservationSection,
  PreviousReportsSection,
} from "@/features/insights/components/InsightSections";
import { PeriodSegment } from "@/features/insights/components/PeriodSegment";
import { WeeklyInsightCard } from "@/features/insights/components/WeeklyInsightCard";
import { INSIGHT_COLORS } from "@/features/insights/constants/insights.constants";
import type { InsightPeriod } from "@/features/insights/types/insights.types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function InsightsScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<InsightPeriod>("week");
  const data = MOCK_WEEKLY_INSIGHT;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Буцах"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            }
          }}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={INSIGHT_COLORS.title} />
        </Pressable>
        <Text style={styles.headerTitle}>AI Insight</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <PeriodSegment value={period} onChange={setPeriod} />

        <View style={styles.cardWrap}>
          <WeeklyInsightCard data={data} />
        </View>

        <AiObservationSection
          observation={data.aiObservation}
          items={data.observations}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Дэлгэрэнгүй тайлан"
          style={({ pressed }) => [
            styles.detailButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="stats-chart" size={18} color="#FFFFFF" />
          <Text style={styles.detailButtonText}>Дэлгэрэнгүй тайлан</Text>
        </Pressable>

        <PreviousReportsSection reports={data.previousReports} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: INSIGHT_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: INSIGHT_COLORS.title,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  cardWrap: {
    marginTop: 16,
  },
  detailButton: {
    marginTop: 20,
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: INSIGHT_COLORS.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  detailButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

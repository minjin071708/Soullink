import {
  CALENDAR_COLORS,
  MOOD_CONFIG,
} from "@/features/calendar/constants/calendar.constants";
import { useJournalDetail } from "@/features/calendar/hooks/useJournalDetail";
import { formatJournalDateTimeMn } from "@/features/calendar/utils/calendar.utils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type JournalDetailScreenProps = {
  diaryId?: number;
};

export function JournalDetailScreen({ diaryId }: JournalDetailScreenProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useJournalDetail(diaryId);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Буцах"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={CALENDAR_COLORS.primary} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Тэмдэглэл</Text>
          {data ? (
            <Text style={styles.subtitle}>
              {formatJournalDateTimeMn(data.date, data.createdAt)}
            </Text>
          ) : null}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={CALENDAR_COLORS.primary} size="large" />
        </View>
      ) : null}

      {isError || (!isLoading && !data) ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Тэмдэглэл олдсонгүй</Text>
          <Text style={styles.errorBody}>
            {/* TODO: Connect real journal detail API when backend is ready. */}
            Journal detail API холбогдоогүй эсвэл өгөгдөл байхгүй байна.
          </Text>
        </View>
      ) : null}

      {data ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.moodCard}>
            <Image
              source={MOOD_CONFIG[data.mood].image}
              style={styles.moodImage}
              contentFit="contain"
            />
            <Text style={styles.moodLabel}>{MOOD_CONFIG[data.mood].label}</Text>
            {data.weatherLabel ? (
              <View style={styles.weatherRow}>
                <Ionicons name="sunny-outline" size={14} color={CALENDAR_COLORS.muted} />
                <Text style={styles.weatherText}>{data.weatherLabel}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.journalCard}>
            <Text style={styles.sectionTitle}>Өнөөдрийн тэмдэглэл</Text>
            <Text style={styles.journalBody}>{data.content}</Text>
          </View>

          {data.hasAiAnalysis ? (
            <View style={styles.analysisCard}>
              <View style={styles.analysisHeader}>
                <View style={styles.sparkleIcon}>
                  <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                </View>
                <Text style={styles.analysisTitle}>AI-ийн товч дүгнэлт</Text>
              </View>

              <AnalysisRow label="Гол мэдрэмж" value={data.primaryEmotion ?? "—"} />
              <AnalysisRow label="Өдөөгч" value={data.trigger ?? "—"} />
              <AnalysisRow label="Бодол" value={data.thought ?? "—"} />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Өдрийн AI дүгнэлт харах"
                onPress={() =>
                  router.push({
                    pathname: "/calendar/analysis/[date]",
                    params: { date: data.date },
                  })
                }
                style={({ pressed }) => [
                  styles.fullAnalysisButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.fullAnalysisText}>Бүрэн AI дүгнэлт харах</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={CALENDAR_COLORS.primary}
                />
              </Pressable>

              <Image
                source={require("@/assets/mascotImages/happy.png")}
                style={styles.cornerMascot}
                contentFit="contain"
              />
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function AnalysisRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.analysisRow}>
      <Text style={styles.analysisLabel}>{label}</Text>
      <View style={styles.analysisPill}>
        <Text style={styles.analysisValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CALENDAR_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEE9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: CALENDAR_COLORS.title,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: CALENDAR_COLORS.muted,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: CALENDAR_COLORS.title,
    marginBottom: 8,
  },
  errorBody: {
    fontSize: 14,
    lineHeight: 20,
    color: CALENDAR_COLORS.muted,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 14,
  },
  moodCard: {
    borderRadius: 24,
    backgroundColor: CALENDAR_COLORS.card,
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  moodImage: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  moodLabel: {
    fontSize: 28,
    fontWeight: "700",
    color: CALENDAR_COLORS.primary,
  },
  weatherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  weatherText: {
    fontSize: 13,
    color: CALENDAR_COLORS.muted,
  },
  journalCard: {
    borderRadius: 24,
    backgroundColor: CALENDAR_COLORS.card,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: CALENDAR_COLORS.title,
    marginBottom: 10,
  },
  journalBody: {
    fontSize: 15,
    lineHeight: 24,
    color: CALENDAR_COLORS.title,
  },
  analysisCard: {
    borderRadius: 24,
    backgroundColor: CALENDAR_COLORS.analysisCard,
    padding: 18,
    overflow: "hidden",
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sparkleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: CALENDAR_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: CALENDAR_COLORS.primary,
  },
  analysisRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  analysisLabel: {
    fontSize: 14,
    color: CALENDAR_COLORS.title,
  },
  analysisPill: {
    backgroundColor: CALENDAR_COLORS.card,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  analysisValue: {
    fontSize: 13,
    fontWeight: "600",
    color: CALENDAR_COLORS.title,
  },
  fullAnalysisButton: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fullAnalysisText: {
    fontSize: 14,
    fontWeight: "600",
    color: CALENDAR_COLORS.primary,
  },
  cornerMascot: {
    position: "absolute",
    right: -4,
    bottom: -8,
    width: 72,
    height: 72,
    opacity: 0.9,
  },
});

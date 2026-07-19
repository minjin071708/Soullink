import {
  CALENDAR_COLORS,
} from "@/features/calendar/constants/calendar.constants";
import { useDailyAiAnalysis } from "@/features/calendar/hooks/useDailyAiAnalysis";
import { formatAnalysisDateMn } from "@/features/calendar/utils/calendar.utils";
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

type DailyAiAnalysisScreenProps = {
  date: string;
};

export function DailyAiAnalysisScreen({ date }: DailyAiAnalysisScreenProps) {
  const router = useRouter();
  const { data, isLoading, isError } = useDailyAiAnalysis(date);

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
          <Text style={styles.title}>Өдрийн AI дүгнэлт</Text>
          <Text style={styles.subtitle}>{formatAnalysisDateMn(date)}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={CALENDAR_COLORS.primary} size="large" />
        </View>
      ) : null}

      {isError || (!isLoading && !data) ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>AI дүгнэлт олдсонгүй</Text>
          <Text style={styles.errorBody}>
            {/* TODO: Connect real daily AI analysis API when backend is ready. */}
            Analysis API холбогдоогүй эсвэл энэ өдрийн дүгнэлт байхгүй байна.
          </Text>
        </View>
      ) : null}

      {data ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroCard}>
            <Text style={styles.heroText}>{data.headline}</Text>
            <Image
              source={require("@/assets/mascotImages/happy.png")}
              style={styles.heroMascot}
              contentFit="contain"
            />
          </View>

          <InsightCard
            icon="heart"
            iconColor="#F08BB0"
            iconBg="#FFE8F1"
            label="Гол мэдрэмж"
            labelColor="#E56B9A"
            value={data.primaryEmotion}
          />
          <InsightCard
            icon="sunny"
            iconColor="#E6A23B"
            iconBg="#FFF4DD"
            label="Өдөөгч"
            labelColor="#D9922A"
            value={data.trigger}
          />
          <InsightCard
            icon="chatbubble-ellipses"
            iconColor="#5B8DEF"
            iconBg="#EAF2FF"
            label="Бодлын хэв маяг"
            labelColor="#5B8DEF"
            value={data.thoughtPattern}
          />

          <View style={styles.adviceCard}>
            <View style={styles.adviceCopy}>
              <Text style={styles.adviceTitle}>{data.adviceTitle}</Text>
              <Text style={styles.adviceBody}>{data.adviceBody}</Text>
            </View>
            <Image
              source={require("@/assets/mascotImages/good.png")}
              style={styles.adviceMascot}
              contentFit="contain"
            />
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}

function InsightCard({
  icon,
  iconColor,
  iconBg,
  label,
  labelColor,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  labelColor: string;
  value: string;
}) {
  return (
    <View style={styles.insightCard}>
      <View style={[styles.insightIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.insightCopy}>
        <Text style={[styles.insightLabel, { color: labelColor }]}>{label}</Text>
        <Text style={styles.insightValue}>{value}</Text>
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
    gap: 12,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: "#E8E4FF",
    paddingHorizontal: 18,
    paddingVertical: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 140,
  },
  heroText: {
    flex: 1,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "700",
    color: CALENDAR_COLORS.title,
  },
  heroMascot: {
    width: 96,
    height: 96,
  },
  insightCard: {
    borderRadius: 20,
    backgroundColor: CALENDAR_COLORS.card,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  insightCopy: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 15,
    fontWeight: "600",
    color: CALENDAR_COLORS.title,
  },
  adviceCard: {
    borderRadius: 24,
    backgroundColor: CALENDAR_COLORS.adviceCard,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  adviceCopy: {
    flex: 1,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3E9A6A",
    marginBottom: 8,
  },
  adviceBody: {
    fontSize: 14,
    lineHeight: 21,
    color: CALENDAR_COLORS.title,
  },
  adviceMascot: {
    width: 72,
    height: 72,
  },
});

import { MOOD_IMAGES } from "@/constants/moods";
import { CALENDAR_COLORS } from "@/features/calendar/constants/calendar.constants";
import { useJournalDetail } from "@/features/calendar/hooks/useJournalDetail";
import {
  formatSelectedDateMn,
} from "@/features/calendar/utils/calendar.utils";
import type { EmotionCode } from "@/types/emotionType";
import type { EmotionDiaryData } from "@/types/journalType";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState, type ReactNode } from "react";
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

function isEmotionCode(value: string): value is EmotionCode {
  return value in MOOD_IMAGES;
}

function formatGeneratedAtMn(value: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours < 12 ? "өглөө" : hours < 18 ? "өдөр" : "орой";
  const hour12 = hours % 12 || 12;

  return `${month} сарын ${day} ${period} ${hour12}:${minutes} шинжилгээ үүссэн`;
}

function getMoodImage(code?: string | null) {
  const normalized = (code ?? "").toUpperCase();
  if (isEmotionCode(normalized)) {
    return MOOD_IMAGES[normalized];
  }
  return MOOD_IMAGES.CALM;
}

export function JournalDetailScreen({ diaryId }: JournalDetailScreenProps) {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isFetching } =
    useJournalDetail(diaryId);
  const [diaryOpen, setDiaryOpen] = useState(false);

  const analysis = data?.aiAnalysis ?? null;
  const score = analysis?.averageScore ?? data?.emotionScore ?? null;
  const scoreRatio = useMemo(() => {
    if (score == null || score <= 0) {
      return 0;
    }
    return Math.min(score / 10, 1);
  }, [score]);

  const dateLabel = data?.emotionDate
    ? formatSelectedDateMn(data.emotionDate)
    : "";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Буцах"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={CALENDAR_COLORS.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>AI сэтгэл хөдлөлийн шинжилгээ</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={CALENDAR_COLORS.primary} size="large" />
        </View>
      ) : null}

      {isError || (!isLoading && !data) ? (
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Шинжилгээ олдсонгүй</Text>
          <Text style={styles.errorBody}>
            Тэмдэглэлийн дэлгэрэнгүйг ачаалж чадсангүй. Дахин оролдоно уу.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void refetch();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
              isFetching && styles.disabled,
            ]}
          >
            <Text style={styles.retryText}>Дахин оролдох</Text>
          </Pressable>
        </View>
      ) : null}

      {data ? (
        <>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.dateRow}>
              <Text style={styles.dateText}>{dateLabel}</Text>
              {data.analysisStatus === "SUCCESS" ||
              analysis?.analysisStatus === "SUCCESS" ? (
                <View style={styles.statusBadge}>
                  <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                  <Text style={styles.statusText}>Шинжилгээ дууссан</Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, styles.statusPending]}>
                  <Text style={[styles.statusText, styles.statusPendingText]}>
                    {data.analysisStatus}
                  </Text>
                </View>
              )}
            </View>

            <HeroEmotionCard data={data} score={score} scoreRatio={scoreRatio} />

            {analysis?.summary ? (
              <InfoCard
                icon="sparkles"
                iconColor="#E6A23B"
                iconBg="#FFF4DD"
                title="Өнөөдрийн сэтгэлийн товч"
                body={analysis.summary}
              />
            ) : null}

            {analysis?.scoreTrend === "INSUFFICIENT" ? (
              <InfoCard
                icon="time-outline"
                iconColor={CALENDAR_COLORS.primary}
                iconBg="#EEE9FF"
                title="Өөрчлөлтийн хандлагыг одоохондоо харж байна"
                body={
                  analysis.recentContextDays
                    ? `Бичлэг ${analysis.recentContextDays} өдөр тул урт хугацааны өөрчлөлтийг одоогоор дүгнэхэд хүндрэлтэй.`
                    : "Урт хугацааны өөрчлөлтийг одоогоор дүгнэхэд хүндрэлтэй."
                }
                tint="#F3EEFF"
              />
            ) : null}

            {analysis?.dailyReflection ? (
              <InfoCard
                icon="chatbubble-ellipses"
                iconColor={CALENDAR_COLORS.primary}
                iconBg="#EEE9FF"
                title="Өнөөдрийн эргэцүүлэл"
                body={analysis.dailyReflection}
              />
            ) : null}

            {analysis?.keyPatterns && analysis.keyPatterns.length > 0 ? (
              <SectionCard
                icon="stats-chart"
                iconColor={CALENDAR_COLORS.primary}
                title="Өнөөдрийн бичлэгээс харагдсан урсгал"
              >
                <View style={styles.patternList}>
                  {analysis.keyPatterns.map((pattern) => (
                    <View key={pattern.patternCode || pattern.title} style={styles.patternItem}>
                      <View style={styles.patternIcon}>
                        <Ionicons
                          name="clipboard-outline"
                          size={18}
                          color={CALENDAR_COLORS.primary}
                        />
                      </View>
                      <View style={styles.patternCopy}>
                        <Text style={styles.itemTitle}>{pattern.title}</Text>
                        <Text style={styles.itemBody}>{pattern.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </SectionCard>
            ) : null}

            {analysis?.triggers && analysis.triggers.length > 0 ? (
              <SectionCard
                icon="flash"
                iconColor="#E6A23B"
                title="Сэтгэл хөдлөлтэй хамт гарсан хүчин зүйл"
              >
                <View style={styles.triggerGrid}>
                  {analysis.triggers.map((trigger, index) => (
                    <View
                      key={trigger.triggerCode || trigger.title}
                      style={[
                        styles.triggerCard,
                        index % 2 === 0 ? styles.triggerYellow : styles.triggerPurple,
                      ]}
                    >
                      <Ionicons
                        name={index % 2 === 0 ? "trending-up" : "walk-outline"}
                        size={18}
                        color={index % 2 === 0 ? "#D9922A" : CALENDAR_COLORS.primary}
                      />
                      <Text style={styles.itemTitle}>{trigger.title}</Text>
                      <Text style={styles.itemBody}>{trigger.description}</Text>
                    </View>
                  ))}
                </View>
              </SectionCard>
            ) : null}

            {analysis?.recommendations && analysis.recommendations.length > 0 ? (
              <SectionCard
                icon="heart"
                iconColor="#E56B9A"
                title="Өнөөдрийг үргэлжлүүлэх жижиг санал"
              >
                <View style={styles.recommendList}>
                  {analysis.recommendations.map((item, index) => (
                    <View key={`${item.priority ?? index}-${item.title}`} style={styles.recommendRow}>
                      <View style={styles.recommendIndex}>
                        <Text style={styles.recommendIndexText}>{index + 1}</Text>
                      </View>
                      <View style={styles.recommendCopy}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemBody}>{item.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </SectionCard>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: diaryOpen }}
              onPress={() => setDiaryOpen((open) => !open)}
              style={({ pressed }) => [
                styles.diaryToggle,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.diaryToggleLeft}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={CALENDAR_COLORS.primary}
                />
                <Text style={styles.diaryToggleText}>Миний бичсэн тэмдэглэл</Text>
              </View>
              <Ionicons
                name={diaryOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={CALENDAR_COLORS.muted}
              />
            </Pressable>

            {diaryOpen ? (
              <View style={styles.diaryBodyCard}>
                {data.title ? (
                  <Text style={styles.diaryTitle}>{data.title}</Text>
                ) : null}
                <Text style={styles.diaryBody}>{data.content || "—"}</Text>
                {data.weatherName || data.sleepHours != null ? (
                  <Text style={styles.diaryMeta}>
                    {[
                      data.weatherName ? `Цаг агаар: ${data.weatherName}` : null,
                      data.sleepHours != null
                        ? `Унталт: ${data.sleepHours} цаг`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {analysis?.generatedAt ? (
              <Text style={styles.generatedAt}>
                {formatGeneratedAtMn(analysis.generatedAt)}
              </Text>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Дуусгах"
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.doneButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.doneButtonText}>Дуусгах</Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </SafeAreaView>
  );
}

function HeroEmotionCard({
  data,
  score,
  scoreRatio,
}: {
  data: EmotionDiaryData;
  score: number | null | undefined;
  scoreRatio: number;
}) {
  const emotionCode =
    data.aiAnalysis?.mainEmotionCode || data.emotionCode || "CALM";
  const emotionName =
    data.aiAnalysis?.mainEmotionName || data.emotionName || "—";

  return (
    <View style={styles.heroCard}>
      <View style={styles.heroTop}>
        <Image
          source={getMoodImage(emotionCode)}
          style={styles.heroMascot}
          contentFit="contain"
        />
        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>Өнөөдрийн гол мэдрэмж</Text>
          <Text style={styles.heroEmotion}>{emotionName}</Text>
          <Text style={styles.heroScoreLabel}>Өнөөдрийн сэтгэлийн оноо</Text>
          <Text style={styles.heroScore}>
            <Text style={styles.heroScoreValue}>
              {score == null ? "—" : score.toFixed(1)}
            </Text>
            {" / 10"}
          </Text>
        </View>
      </View>
      <View style={styles.scoreTrack}>
        <LinearGradient
          colors={["#F7C948", "#8A6BE8"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.scoreFill, { width: `${scoreRatio * 100}%` }]}
        />
      </View>
    </View>
  );
}

function InfoCard({
  icon,
  iconColor,
  iconBg,
  title,
  body,
  tint = CALENDAR_COLORS.card,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  tint?: string;
}) {
  return (
    <View style={[styles.infoCard, { backgroundColor: tint }]}>
      <View style={styles.infoHeader}>
        <View style={[styles.infoIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <Text style={styles.infoTitle}>{title}</Text>
      </View>
      <Text style={styles.infoBody}>{body}</Text>
    </View>
  );
}

function SectionCard({
  icon,
  iconColor,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={18} color={iconColor} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F4FC",
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
    backgroundColor: "#EEE9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    color: CALENDAR_COLORS.title,
  },
  headerSpacer: {
    width: 40,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 10,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: CALENDAR_COLORS.title,
  },
  errorBody: {
    fontSize: 14,
    lineHeight: 20,
    color: CALENDAR_COLORS.muted,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: CALENDAR_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: CALENDAR_COLORS.title,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: CALENDAR_COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPending: {
    backgroundColor: "#E8E4F5",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statusPendingText: {
    color: CALENDAR_COLORS.title,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 18,
    gap: 16,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroMascot: {
    width: 96,
    height: 96,
  },
  heroCopy: {
    flex: 1,
  },
  heroLabel: {
    fontSize: 12,
    color: CALENDAR_COLORS.muted,
    marginBottom: 4,
  },
  heroEmotion: {
    fontSize: 28,
    fontWeight: "800",
    color: CALENDAR_COLORS.title,
    marginBottom: 10,
  },
  heroScoreLabel: {
    fontSize: 12,
    color: CALENDAR_COLORS.muted,
    marginBottom: 2,
  },
  heroScore: {
    fontSize: 14,
    color: CALENDAR_COLORS.muted,
    fontWeight: "600",
  },
  heroScoreValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#E6A23B",
  },
  scoreTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#F0ECF8",
    overflow: "hidden",
  },
  scoreFill: {
    height: "100%",
    borderRadius: 999,
  },
  infoCard: {
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: CALENDAR_COLORS.title,
  },
  infoBody: {
    fontSize: 14,
    lineHeight: 21,
    color: CALENDAR_COLORS.title,
  },
  sectionCard: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: CALENDAR_COLORS.title,
  },
  patternList: {
    gap: 10,
  },
  patternItem: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#F8F6FC",
    borderRadius: 16,
    padding: 12,
  },
  patternIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EEE9FF",
    alignItems: "center",
    justifyContent: "center",
  },
  patternCopy: {
    flex: 1,
    gap: 4,
  },
  triggerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  triggerCard: {
    width: "48%",
    flexGrow: 1,
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  triggerYellow: {
    backgroundColor: "#FFF7E8",
  },
  triggerPurple: {
    backgroundColor: "#F3EEFF",
  },
  recommendList: {
    gap: 10,
  },
  recommendRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  recommendIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFE4EE",
    alignItems: "center",
    justifyContent: "center",
  },
  recommendIndexText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#E56B9A",
  },
  recommendCopy: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: CALENDAR_COLORS.title,
  },
  itemBody: {
    fontSize: 13,
    lineHeight: 19,
    color: CALENDAR_COLORS.muted,
  },
  diaryToggle: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  diaryToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  diaryToggleText: {
    fontSize: 14,
    fontWeight: "700",
    color: CALENDAR_COLORS.title,
  },
  diaryBodyCard: {
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: 16,
    gap: 8,
    marginTop: -4,
  },
  diaryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: CALENDAR_COLORS.title,
  },
  diaryBody: {
    fontSize: 14,
    lineHeight: 22,
    color: CALENDAR_COLORS.title,
  },
  diaryMeta: {
    marginTop: 4,
    fontSize: 12,
    color: CALENDAR_COLORS.muted,
  },
  generatedAt: {
    textAlign: "center",
    fontSize: 12,
    color: CALENDAR_COLORS.muted,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  doneButton: {
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: CALENDAR_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

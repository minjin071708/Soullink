import { AppText } from "@/components/ui/AppText";
import { MOOD_IMAGES } from "@/constants/moods";
import { useJournalDetail } from "@/features/calendar/hooks/useJournalDetail";
import { formatEmotionDateLocalized } from "@/features/calendar/utils/calendar.utils";
import { useAppStore } from "@/store/use-language-store";
import type { EmotionCode } from "@/types/emotionType";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const PAGE_BG = "#F4F1F8";
const CARD_BG = "#FFFFFF";
const TEXT = "#1C1C1E";
const MUTED = "#6C6C70";
const GREEN = "#364A31";
const BLUE = "#7388F2";
const TEAL = "#2A9179";
const CORAL = "#E6C923";
const CORAL_SOFT = "rgba(208, 67, 42, 0.12)";
const TEAL_SOFT = "rgba(42, 145, 121, 0.14)";
const PILL_BG = "#F2F2F7";
const DIVIDER = "rgba(60, 60, 67, 0.12)";
const PRIMARY = "#8a6be8";

type JournalDetailScreenProps = {
  diaryId?: number;
  /** When true, skip screen chrome so this can sit under Insights tabs. */
  embedded?: boolean;
};

function isEmotionCode(value: string): value is EmotionCode {
  return value in MOOD_IMAGES;
}

function getMoodImage(code?: string | null) {
  const normalized = (code ?? "").toUpperCase();
  if (isEmotionCode(normalized)) {
    return MOOD_IMAGES[normalized];
  }
  return MOOD_IMAGES.CALM;
}

function formatConfidencePercent(value: number | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const percent = value <= 1 ? Math.round(value * 100) : Math.round(value);
  return Math.max(0, Math.min(100, percent));
}

function formatGeneratedAt(
  value: string,
  language: "EN" | "KO" | "MN" | null
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const locale =
    language === "KO" ? "ko-KR" : language === "MN" ? "mn-MN" : "en-US";

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function JournalDetailScreen({
  diaryId,
  embedded = false,
}: JournalDetailScreenProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const language = useAppStore((state) => state.language);
  const { data, isLoading, isError, refetch, isFetching } =
    useJournalDetail(diaryId);

  const diary = data;
  const analysis = diary?.aiAnalysis ?? null;
  const analysisStatus = diary?.analysisStatus ?? analysis?.analysisStatus;
  const isProcessing = analysisStatus === "PROCESSING";
  const isFailed = analysisStatus === "FAILED";

  const emotionName = diary?.emotionName?.trim() || "";
  const emotionCode = diary?.emotionCode ?? "";
  const emotionDate = diary?.emotionDate ?? "";
  const tags = diary?.tags ?? [];
  const originalContent = diary?.content?.trim() || "";
  const title = analysis?.title?.trim() || "";
  const summary = analysis?.summary?.trim() || "";
  const reflection = analysis?.dailyReflection?.trim() || "";
  const pattern = analysis?.keyPatterns?.[0];
  const trigger = analysis?.triggers?.[0];
  const recommendations = analysis?.recommendations ?? [];
  const safety = analysis?.safety;
  const generatedAt = analysis?.generatedAt?.trim() || "";

  const dateLabel = emotionDate
    ? formatEmotionDateLocalized(emotionDate, language)
    : "";

  const sortedRecommendations = useMemo(
    () =>
      recommendations
        .slice()
        .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)),
    [recommendations]
  );

  const showLoading = isLoading || isProcessing;
  const showError = !showLoading && (isError || !diary || isFailed);
  const Container = embedded ? View : SafeAreaView;

  return (
    <Container
      style={styles.safeArea}
      {...(embedded ? {} : { edges: ["top", "bottom"] as const })}
    >
      {embedded ? null : (
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("calendar.journalDetail.back")}
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={22} color={TEXT} />
          </Pressable>
          <AppText weight="bold" style={styles.headerTitle} numberOfLines={1}>
            {t("calendar.journalDetail.title")}
          </AppText>
          <View style={styles.headerSpacer} />
        </View>
      )}

      {showLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={BLUE} size="large" />
        </View>
      ) : null}

      {showError ? (
        <View style={styles.centered}>
          <AppText weight="bold" style={styles.errorTitle}>
            {t(
              isFailed
                ? "calendar.journalDetail.failedTitle"
                : "calendar.journalDetail.notFoundTitle"
            )}
          </AppText>
          <AppText style={styles.errorBody}>
            {t(
              isFailed
                ? "calendar.journalDetail.failedBody"
                : "calendar.journalDetail.notFoundBody"
            )}
          </AppText>
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
            <AppText weight="bold" style={styles.retryText}>
              {t("calendar.journalDetail.retry")}
            </AppText>
          </Pressable>
        </View>
      ) : null}

      {diary && !showLoading && !showError ? (
        <>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {dateLabel ? (
              <AppText weight="medium" style={styles.dateText}>
                {dateLabel}
              </AppText>
            ) : null}

            <HeroEmotionCard
              emotionCode={emotionCode}
              emotionName={emotionName || "—"}
              analysisTitle={title}
              tags={tags
                .map((tag) => tag.tagName.trim())
                .filter((name) => name.length > 0)}
            />

            {summary ? (
              <TextSectionCard
                icon="clipboard-outline"
                color={GREEN}
                title={t("calendar.journalDetail.summaryTitle")}
                body={summary}
              />
            ) : null}

            {reflection ? (
              <TextSectionCard
                icon="heart"
                color={BLUE}
                title={t("calendar.journalDetail.reflectionTitle")}
                body={reflection}
              />
            ) : null}

            {pattern || trigger ? (
              <View style={styles.splitRow}>
                {pattern?.title ? (
                  <FactCard
                    label={t("calendar.journalDetail.patternLabel")}
                    title={pattern.title}
                    accent={TEAL}
                    badgeColor={TEAL_SOFT}
                    confidence={formatConfidencePercent(pattern.confidence)}
                    confidenceLabel={t("calendar.journalDetail.confidence", {
                      percent: formatConfidencePercent(pattern.confidence) ?? 0,
                    })}
                  />
                ) : null}
                {trigger?.title ? (
                  <FactCard
                    label={t("calendar.journalDetail.triggerLabel")}
                    title={trigger.title}
                    accent={TEAL}
                    badgeColor={TEAL_SOFT}
                    confidence={formatConfidencePercent(trigger.confidence)}
                    confidenceLabel={t("calendar.journalDetail.confidence", {
                      percent: formatConfidencePercent(trigger.confidence) ?? 0,
                    })}
                  />
                ) : null}
              </View>
            ) : null}

            {sortedRecommendations.length > 0 ? (
              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[styles.sectionIcon]}
                  >
                   <MaterialIcons name="insights" size={24} color={CORAL} />
                  </View>
                  <AppText weight="bold" style={[styles.sectionTitle, { color: CORAL }]}>
                    {t("calendar.journalDetail.recommendationsTitle")}
                  </AppText>
                </View>

                {sortedRecommendations.map((recommendation, index) => (
                  <RecommendationRow
                    key={`${recommendation.priority ?? index}-${recommendation.title}`}
                    number={index + 1}
                    title={recommendation.title}
                    description={recommendation.description}
                    showDivider={index < sortedRecommendations.length - 1}
                  />
                ))}
              </View>
            ) : null}

            {originalContent ? (
              <OriginalDiaryCard content={originalContent} />
            ) : null}

            <View style={styles.metaBlock}>
              {safety?.riskLevel === "NONE" ? (
                <AppText style={styles.metaText}>
                  {t("calendar.journalDetail.noRiskSignal")}
                </AppText>
              ) : null}
              {generatedAt ? (
                <AppText style={styles.metaText}>
                  {t("calendar.journalDetail.generatedAt", {
                    datetime: formatGeneratedAt(generatedAt, language),
                  })}
                </AppText>
              ) : null}
            </View>
          </ScrollView>

          {embedded ? null : (
            <View style={styles.footer}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("calendar.journalDetail.done")}
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.doneButton,
                  pressed && styles.pressed,
                ]}
              >
                <AppText weight="bold" style={styles.doneButtonText}>
                  {t("calendar.journalDetail.done")}
                </AppText>
              </Pressable>
            </View>
          )}
        </>
      ) : null}
    </Container>
  );
}

function HeroEmotionCard({
  emotionCode,
  emotionName,
  analysisTitle,
  tags,
}: {
  emotionCode: string;
  emotionName: string;
  analysisTitle: string;
  tags: string[];
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.heroRow}>
        <Image
          source={getMoodImage(emotionCode)}
          style={styles.heroMascot}
          contentFit="contain"
        />
        <View style={styles.heroCopy}>
          <AppText weight="semibold" style={styles.heroLabel}>
            {t("calendar.journalDetail.todaysEmotion")}
          </AppText>
          <AppText weight="bold" style={styles.heroEmotion}>
            {emotionName}
          </AppText>
          {analysisTitle ? (
            <AppText style={styles.heroTitle}>{analysisTitle}</AppText>
          ) : null}
          {tags.length > 0 ? (
            <View style={styles.tagRow}>
              {tags.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <AppText weight="medium" style={styles.tagText}>
                    {tag}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function TextSectionCard({
  icon,
  color,
  title,
  body,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.textSectionRow}>
        <View style={[styles.sectionIcon, { backgroundColor: color }]}>
          <Ionicons name={icon} size={15} color="#FFFFFF" />
        </View>
        <View style={styles.textSectionCopy}>
          <AppText weight="bold" style={[styles.sectionTitle, { color }]}>
            {title}
          </AppText>
          <AppText style={styles.sectionBody}>{body}</AppText>
        </View>
      </View>
    </View>
  );
}

function FactCard({
  label,
  title,
  accent,
  badgeColor,
  confidence,
  confidenceLabel,
}: {
  label: string;
  title: string;
  accent: string;
  badgeColor: string;
  confidence: number | null;
  confidenceLabel: string;
}) {
  return (
    <View style={[styles.card, styles.factCard]}>
      <AppText weight="semibold" style={[styles.factLabel, { color: accent }]}>
        {label}
      </AppText>
      <AppText weight="bold" style={styles.factTitle}>
        {title}
      </AppText>
      {confidence != null ? (
        <View style={[styles.confidenceBadge, { backgroundColor: badgeColor }]}>
          <AppText weight="semibold" style={[styles.confidenceText, { color: accent }]}>
            {confidenceLabel}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

function RecommendationRow({
  number,
  title,
  description,
  showDivider,
}: {
  number: number;
  title: string;
  description: string;
  showDivider: boolean;
}) {
  return (
    <View>
      <View style={styles.recommendRow}>
        <View style={styles.recommendIndex}>
          <AppText weight="bold" style={styles.recommendIndexText}>
            {number}
          </AppText>
        </View>
        <View style={styles.recommendCopy}>
          <AppText weight="bold" style={styles.recommendTitle}>
            {title}
          </AppText>
          {description ? (
            <AppText style={styles.recommendBody}>{description}</AppText>
          ) : null}
        </View>
      </View>
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}

function OriginalDiaryCard({ content }: { content: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(open ? 180 : 0, { duration: 200 });
  }, [open, rotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [
          styles.diaryToggle,
          pressed && styles.pressed,
        ]}
      >
        <AppText weight="bold" style={styles.diaryToggleText}>
          {t("calendar.journalDetail.originalDiary")}
        </AppText>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={18} color={MUTED} />
        </Animated.View>
      </Pressable>
      {open ? <AppText style={styles.diaryBody}>{content}</AppText> : null}
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 18,
  elevation: 2,
} as const;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PAGE_BG,
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
    backgroundColor: "rgba(255,255,255,0.86)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    color: TEXT,
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
    color: TEXT,
    textAlign: "center",
  },
  errorBody: {
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    color: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 14,
  },
  dateText: {
    fontSize: 15,
    color: MUTED,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 18,
    ...CARD_SHADOW,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  heroMascot: {
    width: 88,
    height: 88,
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: BLUE,
    marginBottom: 4,
  },
  heroEmotion: {
    fontSize: 26,
    lineHeight: 32,
    color: TEXT,
    letterSpacing: -0.4,
  },
  heroTitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: MUTED,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  tagPill: {
    backgroundColor: PILL_BG,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontSize: 12,
    color: MUTED,
  },
  textSectionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  textSectionCopy: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
    color: TEXT,
  },
  splitRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },
  factCard: {
    flex: 1,
    minWidth: 0,
    gap: 8,
  },
  factLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  factTitle: {
    fontSize: 16,
    lineHeight: 22,
    color: TEXT,
  },
  confidenceBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confidenceText: {
    fontSize: 11,
    lineHeight: 14,
  },
  recommendRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 10,
  },
  recommendIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: CORAL,

    alignItems: "center",
    justifyContent: "center",
  },
  recommendIndexText: {
    fontSize: 13,
    color: "#FFFFFF",
  },
  recommendCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  recommendTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: TEXT,
  },
  recommendBody: {
    fontSize: 13,
    lineHeight: 19,
    color: MUTED,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
    marginLeft: 38,
  },
  diaryToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  diaryToggleText: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
  },
  diaryBody: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    color: TEXT,
  },
  metaBlock: {
    alignItems: "center",
    gap: 4,
    paddingTop: 4,
    paddingBottom: 8,
  },
  metaText: {
    fontSize: 12,
    lineHeight: 18,
    color: MUTED,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  doneButton: {
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  doneButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
});

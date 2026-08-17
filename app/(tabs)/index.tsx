import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { useDayNightTheme } from "@/components/day-night/DayNightProvider";
import { GreetingSection } from "@/components/home/GreetingSection";
import { WeeklyInsightCard } from "@/components/home/WeeklyInsightCard";
import { WeeklyMoodJourneyCard } from "@/components/home/WeeklyMoodJourneyCard";
import { MOODS } from "@/constants/moods";
import { useCommunityPosts } from "@/hooks/community/useCommunityPosts";
import { useAuthStore } from "@/store/authStore";
import type { CommunityPost } from "@/types/community";
import type { MoodId } from "@/types/moodType";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ListRenderItemInfo,
  type ViewToken,
} from "react-native";

const DAY_SCREEN_BG = "#F3E5D9";
const NIGHT_SCREEN_BG = "#f5ece9";
const CONTENT_TEXT = "#2A2A6A";
const MUTED = "#7A7596";
const PRIMARY = "#8A6BE8";
const BADGE_BG = "#F5F0FF";
const GLASS_CARD_PADDING = 18;
const CONTENT_HORIZONTAL_PADDING = 20;
const HOME_COMMUNITY_POST_LIMIT = 5;
const CARD_GAP = 16;
const SIDE_INSET = 24;

type GreetingKey = "Good Morning" | "Good Afternoon" | "Good Evening";

function getGreetingKey(date: Date = new Date()): {
  key: GreetingKey;
  emoji: string;
} {
  const hour = date.getHours();

  if (hour >= 6 && hour < 12) {
    return { key: "Good Morning", emoji: "☀️" };
  }

  if (hour >= 12 && hour < 18) {
    return { key: "Good Afternoon", emoji: "🌤️" };
  }

  return { key: "Good Evening", emoji: "🌙" };
}

function PageDots({
  count,
  activeIndex,
}: {
  count: number;
  activeIndex: number;
}) {
  if (count <= 1) {
    return null;
  }

  return (
    <View style={styles.pageDots}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[
            styles.pageDot,
            index === activeIndex ? styles.pageDotActive : null,
          ]}
        />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const member = useAuthStore((state) => state.member);
  const { period } = useDayNightTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [activePostIndex, setActivePostIndex] = useState(0);
  const [postsSwipeEnabled, setPostsSwipeEnabled] = useState(true);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const displayName =
    member?.nickname?.trim() ||
    member?.memberId?.trim() ||
    t("home.friend");

  const greeting = getGreetingKey();
  const screenBackground =
    period === "night" ? NIGHT_SCREEN_BG : DAY_SCREEN_BG;

  const cardWidth = Math.min(windowWidth - SIDE_INSET * 2, 340);
  const itemWidth = cardWidth + CARD_GAP;

  const communityPostsQuery = useCommunityPosts({
    sort: "LATEST",
    size: HOME_COMMUNITY_POST_LIMIT,
  });
  const communityPosts = useMemo(
    () =>
      (
        communityPostsQuery.data?.pages.flatMap((page) => page.data.content) ??
        []
      ).slice(0, HOME_COMMUNITY_POST_LIMIT),
    [communityPostsQuery.data]
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) {
        setActivePostIndex(first.index);
      }
    }
  ).current;

  const handleMoodPress = (mood: MoodId) => {
    setSelectedMood(mood);

    setTimeout(() => {
      router.push({
        pathname: "/journal/write",
        params: { mood },
      });
    }, 140);
  };

  const renderCommunityPost = ({
    item,
  }: ListRenderItemInfo<CommunityPost>) => (
    <View style={{ width: itemWidth, alignItems: "center" }}>
      <CommunityPostCard
        post={item}
        width={cardWidth}
        onPress={(post) => {
          router.push(`/(tabs)/community/post/${post.postId}` as Href);
        }}
        onImageGestureActiveChange={(active) => {
          setPostsSwipeEnabled(!active);
        }}
      />
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: screenBackground }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <GreetingSection
          greeting={`${t(greeting.key)},`}
          username={displayName}
          greetingIcon={greeting.emoji}
        />

        <View style={styles.content}>
          <View style={styles.glassCard}>
            <Text style={styles.glassTitle}>{t("home.howAreYouFeeling")}</Text>
            <Text style={styles.glassSubtitle}>
              {t("home.chooseYourFeeling")}
            </Text>

            <View style={styles.moodGrid}>
              {MOODS.map((mood) => {
                const isSelected = selectedMood === mood.id;

                return (
                  <Pressable
                    key={mood.id}
                    accessibilityRole="button"
                    accessibilityLabel={t(mood.labelKey)}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => handleMoodPress(mood.id)}
                    style={({ pressed }) => [
                      styles.moodPill,
                      {
                        borderColor: isSelected
                          ? "rgba(255, 255, 255, 0.55)"
                          : "rgba(255,255,255,0.72)",
                      },
                      isSelected && styles.moodPillSelected,
                      pressed && styles.moodPressed,
                    ]}
                  >
                    <View style={styles.moodCircle}>
                      <Image
                        source={mood.image}
                        style={styles.moodImage}
                        contentFit="contain"
                      />
                    </View>
                    <Text style={styles.moodLabel} numberOfLines={1}>
                      {t(mood.labelKey)}
                    </Text>
                    {isSelected ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={CONTENT_TEXT}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
              {/* Mood journey for the current week */}
          <WeeklyMoodJourneyCard />
        </View>
        <View>
        <WeeklyInsightCard />
        </View>
        {communityPosts.length > 0 ? (
          <View style={styles.communitySection}>
            <View style={styles.communityHeader}>
              <View style={styles.communityHeaderTitleRow}>
                <Ionicons name="sparkles" size={16} color={PRIMARY} />
                <Text style={styles.communityHeaderTitle}>
                  {t("home.similarStories.title")}
                </Text>
              </View>
              <Text style={styles.communityHeaderSubtitle}>
                {t("home.similarStories.subtitle")}
              </Text>
            </View>

            <FlatList
              data={communityPosts}
              keyExtractor={(item) => String(item.postId)}
              horizontal
              nestedScrollEnabled
              scrollEnabled={postsSwipeEnabled}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={itemWidth}
              snapToAlignment="start"
              disableIntervalMomentum
              contentContainerStyle={{
                paddingHorizontal:
                  (windowWidth - cardWidth) / 2 - CARD_GAP / 2,
              }}
              getItemLayout={(_, index) => ({
                length: itemWidth,
                offset: itemWidth * index,
                index,
              })}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              renderItem={renderCommunityPost}
            />

            <PageDots
              count={communityPosts.length}
              activeIndex={activePostIndex}
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("home.similarStories.seeAll")}
              onPress={() => router.push("/community" as Href)}
              style={({ pressed }) => [
                styles.seeAllButton,
                pressed && styles.moodPressed,
              ]}
            >
              <Text style={styles.seeAllButtonText}>
                {t("home.similarStories.seeAll")}
              </Text>
              <Ionicons name="arrow-forward" size={14} color={PRIMARY} />
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 12,
  },
  content: {
    paddingHorizontal: CONTENT_HORIZONTAL_PADDING,
    paddingTop: 16,
  },
  glassCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
    backgroundColor: "rgba(255, 255, 255, 0.66)",
    padding: GLASS_CARD_PADDING,
    overflow: "hidden",
  },
  glassTitle: {
    color: CONTENT_TEXT,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  glassSubtitle: {
    color: CONTENT_TEXT,
    opacity: 0.68,
    marginTop: 4,
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  moodPill: {
    width: "48.5%",
    minHeight: 58,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgb(255, 255, 255)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  moodPillSelected: {
    shadowColor: "#8A6BE8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  moodPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  moodCircle: {
    width: 45,
    height: 45,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  moodImage: {
    width: "100%",
    height: "100%",
  },
  moodLabel: {
    flex: 1,
    color: CONTENT_TEXT,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    textAlign: "left",
  },
  communitySection: {
    marginTop: 8,
    marginBottom: 24,
  },
  communityHeader: {
    alignItems: "center",
    paddingHorizontal: CONTENT_HORIZONTAL_PADDING,
    marginBottom: 16,
    gap: 6,
  },
  communityHeaderTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  communityHeaderTitle: {
    color: CONTENT_TEXT,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
  },
  communityHeaderSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  pageDots: {
    flexDirection: "row",
    gap: 6,
    marginTop: 12,
    alignSelf: "center",
  },
  pageDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(138,107,232,0.25)",
  },
  pageDotActive: {
    backgroundColor: PRIMARY,
  },
  seeAllButton: {
    alignSelf: "center",
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: BADGE_BG,
  },
  seeAllButtonText: {
    color: PRIMARY,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
  },
});

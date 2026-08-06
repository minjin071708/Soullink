import {
  MOCK_SIMILAR_STORIES,
  type SimilarStoryMock,
} from "@/components/home/similarStoriesMock";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type ListRenderItemInfo,
  type ViewToken,
} from "react-native";

const TEXT = "#2A2A6A";
const MUTED = "#7A7596";
const PRIMARY = "#8A6BE8";
const BADGE_BG = "#F5F0FF";
const CARD_GAP = 16;
const SIDE_INSET = 24;

function formatRelativeTime(
  iso: string,
  formatDays: (count: number) => string,
  formatMonths: (count: number) => string
) {
  const created = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.max(0, Math.floor((now - created) / (1000 * 60 * 60 * 24)));

  if (days < 30) {
    return formatDays(Math.max(days, 1));
  }

  return formatMonths(Math.max(1, Math.floor(days / 30)));
}

function PageDots({
  count,
  activeIndex,
  containerStyle,
  dotStyle,
  activeDotStyle,
}: {
  count: number;
  activeIndex: number;
  containerStyle?: object;
  dotStyle?: object;
  activeDotStyle?: object;
}) {
  if (count <= 1) {
    return null;
  }

  return (
    <View style={containerStyle}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[dotStyle, index === activeIndex ? activeDotStyle : null]}
        />
      ))}
    </View>
  );
}

type StoryImageCarouselProps = {
  story: SimilarStoryMock;
  width: number;
};

function StoryImageCarousel({ story, width }: StoryImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const imageHeight = Math.round(width * 0.62 * 2);
  const images = story.imageSources;

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(Math.max(0, Math.min(nextIndex, images.length - 1)));
  };

  return (
    <View style={[styles.imageWrap, { height: imageHeight }]}>
      <ScrollView
        horizontal
        pagingEnabled
        bounces={false}
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={{ width, height: imageHeight }}
      >
        {images.map((source, index) => (
          <Image
            key={`${story.postId}-img-${index}`}
            source={source}
            style={[styles.storyImage, { width, height: imageHeight }]}
            contentFit="cover"
          />
        ))}
      </ScrollView>

      <View style={styles.matchBadge} pointerEvents="none">
        <Ionicons name="sparkles" size={12} color={PRIMARY} />
        <Text style={styles.matchBadgeText}>AI Match {story.matchScore}%</Text>
      </View>

      <PageDots
        count={images.length}
        activeIndex={activeIndex}
        containerStyle={styles.imageDots}
        dotStyle={styles.imageDot}
        activeDotStyle={styles.imageDotActive}
      />
    </View>
  );
}

type StoryCardProps = {
  story: SimilarStoryMock;
  width: number;
};

function StoryCard({ story, width }: StoryCardProps) {
  const { t } = useTranslation();
  const innerWidth = width - 32;

  return (
    <View style={[styles.card, { width }]}>
      <StoryImageCarousel story={story} width={innerWidth} />

      <View style={styles.authorRow}>
        <Image
          source={story.authorAvatarSource}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.authorCopy}>
          <Text style={styles.authorName} numberOfLines={1}>
            {story.authorName}
          </Text>
          <Text style={styles.authorTime} numberOfLines={1}>
            {formatRelativeTime(
              story.createdAt,
              (count) => t("home.similarStories.daysAgo", { count }),
              (count) => t("home.similarStories.monthsAgo", { count })
            )}
          </Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText} numberOfLines={1}>
            {story.categoryName}
          </Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {story.title}
      </Text>
      <Text style={styles.preview} numberOfLines={2}>
        {story.contentPreview}
      </Text>

      <View style={styles.actionsRow} className="mt-3">
        <View style={styles.actionGroup}>
          <Ionicons
            name={story.isLiked ? "heart" : "heart-outline"}
            size={24}
            color={story.isLiked ? "#E56B8A" : MUTED}
          />
          <Text style={styles.actionCount}>{story.likesCount}</Text>
        </View>
        <View style={styles.actionGroup}>
          <Ionicons name="chatbubble-outline" size={22} color={MUTED} />
          <Text style={styles.actionCount}>{story.commentsCount}</Text>
        </View>
        <View style={styles.actionSpacer} />
        <Ionicons
          name={story.isBookmarked ? "bookmark" : "bookmark-outline"}
          size={24}
          color={MUTED}
        />
      </View>
    </View>
  );
}

export function SimilarStoriesSection() {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
  }).current;

  const cardWidth = Math.min(windowWidth - SIDE_INSET * 2, 340);
  const itemWidth = cardWidth + CARD_GAP;
  const stories = useMemo(
    () => MOCK_SIMILAR_STORIES.filter((story) => story.imageSources.length > 2),
    []
  );

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) {
        setActiveStoryIndex(first.index);
      }
    }
  ).current;

  if (stories.length === 0) {
    return null;
  }

  const renderItem = ({ item }: ListRenderItemInfo<SimilarStoryMock>) => (
    <View style={{ width: itemWidth, alignItems: "center" }}>
      <StoryCard story={item} width={cardWidth} />
    </View>
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="sparkles" size={16} color={PRIMARY} />
          <Text style={styles.headerTitle}>
            {t("home.similarStories.title")}
          </Text>
        </View>
        <Text style={styles.headerSubtitle}>
          {t("home.similarStories.subtitle")}
        </Text>
      </View>

      <FlatList
        data={stories}
        keyExtractor={(item) => String(item.postId)}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={itemWidth}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={{
          paddingHorizontal: (windowWidth - cardWidth) / 2 - CARD_GAP / 2,
        }}
        getItemLayout={(_, index) => ({
          length: itemWidth,
          offset: itemWidth * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={renderItem}
      />

      <PageDots
        count={stories.length}
        activeIndex={activeStoryIndex}
        containerStyle={styles.pageDots}
        dotStyle={styles.pageDot}
        activeDotStyle={styles.pageDotActive}
      />

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t("home.similarStories.seeAll")}
        activeOpacity={0.86}
        style={styles.seeAllStoriesButton}
        onPress={() => router.push("/community" as Href)}
      >
        <Text style={styles.seeAllStoriesButtonText}>
          {t("home.similarStories.seeAll")}
        </Text>
        <Ionicons name="arrow-forward" size={14} color={PRIMARY} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    marginBottom: 24,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 6,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerTitle: {
    color: TEXT,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#1A1238",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  imageWrap: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "#EEEAF8",
  },
  storyImage: {
    borderRadius: 18,
  },
  matchBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  matchBadgeText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "700",
  },
  imageDots: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  imageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  imageDotActive: {
    backgroundColor: "#FFFFFF",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: BADGE_BG,
  },
  authorCopy: {
    flex: 1,
    gap: 2,
  },
  authorName: {
    color: TEXT,
    fontSize: 16,
    fontWeight: "700",
  },
  authorTime: {
    color: MUTED,
    fontSize: 14,
  },
  categoryBadge: {
    maxWidth: 96,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: BADGE_BG,
  },
  categoryText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    color: TEXT,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "800",
    marginBottom: 6,
  },
  preview: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionCount: {
    color: MUTED,
    fontSize: 16,
    fontWeight: "600",
  },
  actionSpacer: {
    flex: 1,
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
  seeAllStoriesButton: {
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
  seeAllStoriesButtonText: {
    color: PRIMARY,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
  },
});

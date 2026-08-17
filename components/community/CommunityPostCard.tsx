import { CommunityCommentSheet } from "@/components/community/CommunityComments";
import { useToggleCommunityPostLike } from "@/hooks/community/useToggleCommunityPostLike";
import type { CommunityPost } from "@/types/community";
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  ScrollView as GestureScrollView,
} from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TEXT = "#2A2A6A";
const MUTED = "#7A7596";
const APPLE_INK = "#1d1d1f";
const PRIMARY = "#8A6BE8";
const BADGE_BG = "#F5F0FF";
const DEFAULT_AVATAR = require("@/assets/mascotImages/maskot3dwhite.png");

function formatRelativeTime(
  iso: string,
  formatDays: (count: number) => string,
  formatMonths: (count: number) => string
) {
  const created = new Date(iso).getTime();
  if (Number.isNaN(created)) {
    return "";
  }

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
  floating = true,
}: {
  count: number;
  activeIndex: number;
  floating?: boolean;
}) {
  if (count <= 1) {
    return null;
  }

  return (
    <View
      style={floating ? styles.imageDots : styles.inlineDots}
      pointerEvents="none"
    >
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[
            styles.imageDot,
            index === activeIndex ? styles.imageDotActive : null,
          ]}
        />
      ))}
    </View>
  );
}

type CardImageSource = number | { uri: string };

function TappableImage({
  source,
  width,
  height,
  onOpen,
}: {
  source: CardImageSource;
  width: number | `${number}%`;
  height: number;
  onOpen: () => void;
}) {
  const tap = Gesture.Tap()
    .maxDistance(14)
    .maxDuration(400)
    .shouldCancelWhenOutside(true)
    .onEnd((_event, success) => {
      if (success) {
        runOnJS(onOpen)();
      }
    });

  return (
    <GestureDetector gesture={tap}>
      <View collapsable={false} style={{ width, height }}>
        <Pressable
          accessibilityRole="imagebutton"
          onPress={onOpen}
          style={{ width, height }}
        >
          <Image
            source={source}
            style={[styles.storyImage, { width, height }]}
            contentFit="cover"
            pointerEvents="none"
          />
        </Pressable>
      </View>
    </GestureDetector>
  );
}

type FullscreenImageViewerProps = {
  visible: boolean;
  images: CardImageSource[];
  initialIndex: number;
  onClose: () => void;
};

function FullscreenImageViewer({
  visible,
  images,
  initialIndex,
  onClose,
}: FullscreenImageViewerProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);
  const scrollRef = useRef<GestureScrollView>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setIndex(initialIndex);
    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: initialIndex * windowWidth,
        animated: false,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [visible, initialIndex, windowWidth]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      hardwareAccelerated
      onRequestClose={onClose}
    >
      <View style={styles.viewerRoot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          hitSlop={12}
          style={[
            styles.viewerClose,
            { top: insets.top + 8, right: Math.max(insets.right, 12) },
          ]}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </Pressable>

        {images.length > 1 ? (
          <Text
            style={[styles.viewerCounter, { top: insets.top + 16 }]}
            pointerEvents="none"
          >
            {index + 1} / {images.length}
          </Text>
        ) : null}

        <GestureScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          onMomentumScrollEnd={(event) => {
            const next = Math.round(
              event.nativeEvent.contentOffset.x / windowWidth
            );
            setIndex(Math.max(0, Math.min(next, images.length - 1)));
          }}
          style={{ width: windowWidth, height: windowHeight }}
        >
          {images.map((source, imageIndex) => (
            <View
              key={`viewer-${imageIndex}`}
              style={{
                width: windowWidth,
                height: windowHeight,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={source}
                style={{
                  width: windowWidth,
                  height: windowHeight * 0.78,
                }}
                contentFit="contain"
              />
            </View>
          ))}
        </GestureScrollView>

        <View
          style={[styles.viewerDots, { bottom: insets.bottom + 20 }]}
          pointerEvents="none"
        >
          <PageDots count={images.length} activeIndex={index} floating={false} />
        </View>
      </View>
    </Modal>
  );
}

type CommunityPostCardProps = {
  post: CommunityPost;
  /** Card outer width — used for horizontal carousel paging */
  width?: number;
  matchScore?: number;
  title?: string;
  categoryName?: string;
  isBookmarked?: boolean;
  /** Local require() images (home mock). Falls back to post.images URLs. */
  localImageSources?: CardImageSource[];
  authorAvatarSource?: CardImageSource;
  onPress?: (post: CommunityPost) => void;
  /** Disable parent horizontal swiper while image carousel is dragged */
  onImageGestureActiveChange?: (active: boolean) => void;
};

export const CommunityPostCard = memo(function CommunityPostCard({
  post,
  width,
  matchScore,
  title,
  categoryName,
  isBookmarked = false,
  localImageSources,
  authorAvatarSource,
  onPress,
  onImageGestureActiveChange,
}: CommunityPostCardProps) {
  const { t } = useTranslation();
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [measuredInnerWidth, setMeasuredInnerWidth] = useState<number | null>(
    null
  );

  const categoryLabel =
    categoryName ??
    (post.categoryCode === "COUNSEL"
      ? t("community.filters.counsel")
      : t("community.filters.knowledge"));

  const preview = post.content?.trim() ?? "";
  const displayTitle = title?.trim() || undefined;

  const remoteImages = (post.images ?? [])
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => ({ uri: image.imageUrl }));

  const images: CardImageSource[] =
    localImageSources && localImageSources.length > 0
      ? localImageSources
      : remoteImages;

  const avatarSource =
    authorAvatarSource ??
    (post.author.profileImageUrl
      ? { uri: post.author.profileImageUrl }
      : DEFAULT_AVATAR);

  const cardWidth = width ?? undefined;
  const innerWidth =
    width != null ? width - 32 : (measuredInnerWidth ?? undefined);
  const imageHeight =
    innerWidth != null ? Math.round(innerWidth * 0.62 * 2) : 220;
  const canPage = innerWidth != null && images.length > 1;

  const openViewer = useCallback(
    (index: number) => {
      if (images.length === 0) {
        return;
      }
      const safeIndex = Math.max(0, Math.min(index, images.length - 1));
      setViewerIndex(safeIndex);
      setViewerVisible(true);
      onImageGestureActiveChange?.(false);
    },
    [images.length, onImageGestureActiveChange]
  );

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (innerWidth == null || images.length === 0) {
      return;
    }
    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / innerWidth
    );
    setActiveImageIndex(Math.max(0, Math.min(nextIndex, images.length - 1)));
  };

  const likeToggle = useToggleCommunityPostLike(post.postId);

  const handleCardPress = () => onPress?.(post);
  const handleCommentPress = () => setCommentSheetOpen(true);

  const handleLikePress = () => {
    if (likeToggle.isPending) {
      return;
    }
    likeToggle.mutate();
  };

  return (
    <View
      style={[styles.card, cardWidth != null ? { width: cardWidth } : null]}
    >
      <Pressable
        accessibilityRole="button"
        onPress={handleCardPress}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        <View style={styles.authorRow}>
          <Image
            source={avatarSource}
            style={styles.avatar}
            contentFit="cover"
          />
          <View style={styles.authorCopy}>
            <Text style={styles.authorName} numberOfLines={1}>
              {post.author.nickname}
            </Text>
            <Text style={styles.authorTime} numberOfLines={1}>
              {formatRelativeTime(
                post.createdAt,
                (count) => t("home.similarStories.daysAgo", { count }),
                (count) => t("home.similarStories.monthsAgo", { count })
              )}
            </Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {categoryLabel}
            </Text>
          </View>
        </View>
      </Pressable>

      {images.length > 0 ? (
        <View
          style={[
            styles.imageWrap,
            { height: imageHeight },
            width != null && innerWidth != null ? { width: innerWidth } : null,
          ]}
          onLayout={(event) => {
            if (width != null) {
              return;
            }
            const next = Math.round(event.nativeEvent.layout.width);
            if (next > 0 && next !== measuredInnerWidth) {
              setMeasuredInnerWidth(next);
            }
          }}
        >
          {canPage ? (
            <GestureScrollView
              horizontal
              pagingEnabled
              bounces={false}
              nestedScrollEnabled
              directionalLockEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              onScrollBeginDrag={() => onImageGestureActiveChange?.(true)}
              onScrollEndDrag={() => onImageGestureActiveChange?.(false)}
              onMomentumScrollEnd={(event) => {
                onImageGestureActiveChange?.(false);
                onMomentumScrollEnd(event);
              }}
              style={{ width: innerWidth, height: imageHeight }}
            >
              {images.map((source, index) => (
                <TappableImage
                  key={`${post.postId}-img-${index}`}
                  source={source}
                  width={innerWidth}
                  height={imageHeight}
                  onOpen={() => openViewer(index)}
                />
              ))}
            </GestureScrollView>
          ) : (
            <TappableImage
              source={images[0]}
              width={innerWidth ?? "100%"}
              height={imageHeight}
              onOpen={() => openViewer(0)}
            />
          )}

          {matchScore != null ? (
            <View style={styles.matchBadge} pointerEvents="none">
              <Ionicons name="sparkles" size={12} color={PRIMARY} />
              <Text style={styles.matchBadgeText}>
                AI Match {matchScore}%
              </Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View full image"
            hitSlop={8}
            onPress={() => openViewer(activeImageIndex)}
            style={styles.expandButton}
          >
            <AntDesign name="expand" size={16} color="#FFFFFF" />
          </Pressable>

          {images.length > 1 ? (
            <View style={styles.imageCounter} pointerEvents="none">
              <Text style={styles.imageCounterText}>
                {activeImageIndex + 1} / {images.length}
              </Text>
            </View>
          ) : null}

          <PageDots count={images.length} activeIndex={activeImageIndex} />
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={handleCardPress}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {displayTitle ? (
          <Text style={styles.title} numberOfLines={2}>
            {displayTitle}
          </Text>
        ) : null}

        {preview ? (
          <Text style={styles.preview} numberOfLines={displayTitle ? 2 : 4}>
            {preview}
          </Text>
        ) : null}
      </Pressable>

      <View style={styles.actionsRow}>
        {/* post like */}
        <Pressable
          accessibilityRole="button"
          disabled={likeToggle.isPending}
          onPress={handleLikePress}
          hitSlop={8}
          style={styles.actionGroup}
        >
          <Ionicons
            name={post.likedByMe ? "heart" : "heart-outline"}
            size={24}
            color={post.likedByMe ? "#FF3B30" : APPLE_INK}
          />
          <Text style={styles.actionCount}>{post.likeCount}</Text>
        </Pressable>
        {/* post comment */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("community.detail.comments", {
            count: post.commentCount,
          })}
          onPress={handleCommentPress}
          hitSlop={8}
          style={styles.actionGroup}
        >
          <Ionicons name="chatbubble-outline" size={22} color={APPLE_INK} />
          <Text style={styles.actionCount}>{post.commentCount}</Text>
        </Pressable>
        {/* post bookmark */}
        <View style={styles.actionSpacer} />
        <Ionicons
          name={isBookmarked ? "bookmark" : "bookmark-outline"}
          size={24}
          color={APPLE_INK}
        />
      </View>

      <CommunityCommentSheet
        visible={commentSheetOpen}
        postId={post.postId}
        commentCount={post.commentCount}
        onClose={() => setCommentSheetOpen(false)}
      />

      <FullscreenImageViewer
        visible={viewerVisible}
        images={images}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 0,
    paddingVertical: 20,
    shadowColor: "#1A1238",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  pressed: {
    opacity: 0.92,
  },
  imageWrap: {
    borderRadius: 0,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "#EEEAF8",
    alignSelf: "center",
    width: "100%",
  },
  storyImage: {
    borderRadius: 0,
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
  expandButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,16,40,0.55)",
  },
  imageCounter: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(20, 16, 40, 0.55)",
  },
  imageCounterText: {
    color: "#FFFFFF",
    fontSize: 12,
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
  inlineDots: {
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
    paddingHorizontal: 16,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 50,
    backgroundColor: BADGE_BG,
  },
  authorCopy: {
    flex: 1,
    gap: 0,
  },
  authorName: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "700",
  },
  authorTime: {
    color: MUTED,
    fontSize: 13,
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
    color: APPLE_INK,
    fontSize: 14,
    lineHeight: 19,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 3,
    paddingHorizontal: 16,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionCount: {
    color: APPLE_INK,
    fontSize: 16,
    fontWeight: "600",
  },
  actionSpacer: {
    flex: 1,
  },
  viewerRoot: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.94)",
    ...Platform.select({
      android: { elevation: 24 },
      default: {},
    }),
  },
  viewerClose: {
    position: "absolute",
    zIndex: 3,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(48, 48, 48, 0.16)",
  },
  viewerCounter: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 3,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  viewerDots: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 3,
    alignItems: "center",
  },
});

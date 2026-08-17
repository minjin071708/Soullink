import { CommunityComments } from "@/components/community/CommunityComments";
import { useDeleteCommunityPost } from "@/hooks/community/useCommunityPosts";
import { useCommunityPostsDetail } from "@/hooks/community/useCommunityPostsDetail";
import { useToggleCommunityPostLike } from "@/hooks/community/useToggleCommunityPostLike";
import { useAuthStore } from "@/store/authStore";
import type { CommunityPostDetail } from "@/types/community";
import { isSameMemberId } from "@/utils/memberId";
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const TEXT = "#1C1C1E";
const SECONDARY = "#8E8E93";
const BG = "#F2F2F7";
const CARD = "#FFFFFF";
const ACCENT = "#8A6BE8";
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

  const days = Math.max(
    0,
    Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24))
  );

  if (days < 30) {
    return formatDays(Math.max(days, 1));
  }

  return formatMonths(Math.max(1, Math.floor(days / 30)));
}

function FullscreenImageViewer({
  visible,
  images,
  initialIndex,
  onClose,
}: {
  visible: boolean;
  images: { uri: string }[];
  initialIndex: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView>(null);

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
          accessibilityLabel={t("community.detail.closeImage")}
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

        <ScrollView
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
              key={`viewer-${source.uri}-${imageIndex}`}
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
        </ScrollView>

        {images.length > 1 ? (
          <View
            style={[styles.viewerDots, { bottom: insets.bottom + 20 }]}
            pointerEvents="none"
          >
            {images.map((_, dotIndex) => (
              <View
                key={dotIndex}
                style={[
                  styles.dot,
                  dotIndex === index ? styles.dotActive : null,
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function PostImages({ images }: { images: { uri: string }[] }) {
  const { width: windowWidth } = useWindowDimensions();
  const imageWidth = windowWidth - 40;
  const imageHeight = Math.round(imageWidth * 1.4);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  if (images.length === 0) {
    return null;
  }

  const openViewer = (index: number) => {
    setViewerIndex(Math.max(0, Math.min(index, images.length - 1)));
    setViewerVisible(true);
  };

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / imageWidth);
    setActiveIndex(Math.max(0, Math.min(next, images.length - 1)));
  };

  return (
    <View style={styles.imageBlock}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        style={{ width: imageWidth, height: imageHeight }}
      >
        {images.map((source, index) => (
          <Pressable
            key={`${source.uri}-${index}`}
            accessibilityRole="imagebutton"
            onPress={() => openViewer(index)}
          >
            <Image
              source={source}
              style={{ width: imageWidth, height: imageHeight }}
              contentFit="cover"
            />
          </Pressable>
        ))}
      </ScrollView>
      <Pressable
        accessibilityRole="button"
        onPress={() => openViewer(activeIndex)}
        style={styles.expandButton}
      >
        <AntDesign name="expand" size={16} color="#FFFFFF" />
      </Pressable>
      {images.length > 1 ? (
        <View style={styles.imageCounter} pointerEvents="none">
          <Text style={styles.imageCounterText}>
            {activeIndex + 1} / {images.length}
          </Text>
        </View>
      ) : null}
      {images.length > 1 ? (
        <View style={styles.dots}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex ? styles.dotActive : null,
              ]}
            />
          ))}
        </View>
      ) : null}
      <FullscreenImageViewer
        visible={viewerVisible}
        images={images}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

function PostBody({ post }: { post: CommunityPostDetail }) {
  const { t } = useTranslation();
  const likeToggle = useToggleCommunityPostLike(post.postId);
  const images = useMemo(
    () =>
      [...post.images]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((image) => ({ uri: image.imageUrl })),
    [post.images]
  );
  const categoryLabel =
    post.categoryCode === "COUNSEL"
      ? t("community.filters.counsel")
      : t("community.filters.knowledge");

  return (
    <>
      <View style={styles.authorCard}>
        <Image
          source={
            post.author.profileImageUrl
              ? { uri: post.author.profileImageUrl }
              : DEFAULT_AVATAR
          }
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.authorCopy}>
          <Text style={styles.authorName}>{post.author.nickname}</Text>
          <Text style={styles.authorMeta}>
            {formatRelativeTime(
              post.createdAt,
              (count) => t("home.similarStories.daysAgo", { count }),
              (count) => t("home.similarStories.monthsAgo", { count })
            )}
          </Text>
        </View>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{categoryLabel}</Text>
        </View>
      </View>

      {post.content?.trim() ? (
        <View style={styles.bodyCard}>
          <Text style={styles.body}>{post.content.trim()}</Text>
        </View>
      ) : null}

      <PostImages images={images} />

      <View style={styles.statsRow}>
        <Pressable
          accessibilityRole="button"
          disabled={likeToggle.isPending}
          onPress={() => {
            if (!likeToggle.isPending) {
              likeToggle.mutate();
            }
          }}
          style={styles.stat}
        >
          <Ionicons
            name={post.likedByMe ? "heart" : "heart-outline"}
            size={20}
            color={post.likedByMe ? "#FF3B30" : SECONDARY}
          />
          <Text style={styles.statText}>
            {t("community.detail.likes", { count: post.likeCount })}
          </Text>
        </Pressable>
        <View style={styles.stat}>
          <Ionicons name="chatbubble-outline" size={18} color={SECONDARY} />
          <Text style={styles.statText}>
            {t("community.detail.comments", { count: post.commentCount })}
          </Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="eye-outline" size={20} color={SECONDARY} />
          <Text style={styles.statText}>
            {t("community.detail.views", { count: post.viewCount })}
          </Text>
        </View>
      </View>
    </>
  );
}

export default function CommunityPostDetailScreen() {
  const { t } = useTranslation();
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const resolvedPostId = Array.isArray(postId) ? postId[0] : postId;
  const myMemberId = useAuthStore((state) => state.member?.memberId);
  const detailQuery = useCommunityPostsDetail(resolvedPostId);
  const deletePost = useDeleteCommunityPost();
  const [menuOpen, setMenuOpen] = useState(false);

  const post = detailQuery.data;
  const isMyPost = isSameMemberId(post?.author.memberId, myMemberId);

  const handleEdit = () => {
    if (!resolvedPostId) {
      return;
    }
    setMenuOpen(false);
    router.push(`/(tabs)/community/edit-post?postId=${resolvedPostId}` as Href);
  };

  const handleDelete = () => {
    if (!resolvedPostId) {
      return;
    }
    setMenuOpen(false);
    Alert.alert(
      t("community.detail.deleteTitle"),
      t("community.detail.deleteMessage"),
      [
        { text: t("community.detail.cancel"), style: "cancel" },
        {
          text: t("community.detail.delete"),
          style: "destructive",
          onPress: () => {
            deletePost.mutate(resolvedPostId, {
              onSuccess: () => {
                router.back();
              },
              onError: () => {
                Alert.alert(
                  t("community.detail.delete"),
                  t("community.detail.deleteError")
                );
              },
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.nav}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("community.detail.back")}
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT} />
        </Pressable>
        <Text style={styles.navTitle}>{t("community.detail.title")}</Text>
        {isMyPost ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("community.detail.more")}
            onPress={() => setMenuOpen(true)}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={TEXT} />
          </Pressable>
        ) : (
          <View style={styles.navSpacer} />
        )}
      </View>

      {detailQuery.isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={ACCENT} />
          <Text style={styles.stateText}>{t("community.detail.loading")}</Text>
        </View>
      ) : detailQuery.isError || !detailQuery.data ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{t("community.detail.error")}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void detailQuery.refetch();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.retryText}>
              {detailQuery.isFetching
                ? t("community.detail.loading")
                : t("community.retry")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <CommunityComments
          postId={detailQuery.data.postId}
          commentCount={detailQuery.data.commentCount}
          header={<PostBody post={detailQuery.data} />}
        />
      )}

      <Modal
        transparent
        visible={menuOpen}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuOpen(false)}
        >
          <View style={styles.menuSheet}>
            <Pressable
              accessibilityRole="button"
              onPress={handleEdit}
              style={({ pressed }) => [
                styles.menuRow,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="create-outline" size={20} color={TEXT} />
              <Text style={styles.menuText}>{t("community.detail.edit")}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={deletePost.isPending}
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.menuRow,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={styles.menuDangerText}>
                {t("community.detail.delete")}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setMenuOpen(false)}
              style={({ pressed }) => [
                styles.menuRow,
                styles.menuCancel,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.menuCancelText}>
                {t("community.detail.cancel")}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
    minHeight: 44,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: TEXT,
  },
  navSpacer: {
    width: 36,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.32)",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 28,
  },
  menuSheet: {
    backgroundColor: CARD,
    borderRadius: 16,
    overflow: "hidden",
  },
  menuRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
  },
  menuText: {
    fontSize: 17,
    color: TEXT,
  },
  menuDangerText: {
    fontSize: 17,
    color: "#FF3B30",
  },
  menuCancel: {
    justifyContent: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5EA",
  },
  menuCancelText: {
    fontSize: 17,
    fontWeight: "600",
    color: ACCENT,
  },
  authorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E5E5EA",
  },
  authorCopy: {
    flex: 1,
    gap: 2,
  },
  authorName: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: TEXT,
  },
  authorMeta: {
    fontSize: 13,
    color: SECONDARY,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#EFEAFF",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: ACCENT,
  },
  bodyCard: {
    marginTop: 18,
    backgroundColor: CARD,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.3,
    color: TEXT,
  },
  imageBlock: {
    marginTop: 18,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: CARD,
  },
  expandButton: {
    position: "absolute",
    bottom: 10,
    left: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  imageCounter: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(59, 59, 59, 0.74)",
  },
  imageCounterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
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
    backgroundColor: "rgba(255,255,255,0.16)",
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
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dots: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },
  statsRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: CARD,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: "500",
    color: SECONDARY,
  },
  stateBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  stateText: {
    color: SECONDARY,
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: CARD,
  },
  retryText: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});

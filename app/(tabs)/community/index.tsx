import {
  MOCK_SIMILAR_STORIES,
  type SimilarStoryMock,
} from "@/components/home/similarStoriesMock";
import type { CommunityCategory, CommunitySort } from "@/types/community";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { router, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEXT = "#2A2A6A";
const MUTED = "#7A7596";
const PRIMARY = "#8A6BE8";
const BADGE_BG = "#F5F0FF";
const SCREEN_BG = "#F7F5FB";

type FilterKey = "ALL" | CommunityCategory;
type SortKey = CommunitySort;

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

function CommunityPostCard({ story }: { story: SimilarStoryMock }) {
  const { t } = useTranslation();
  const cover = story.imageSources[0];

  return (
    <View style={styles.card}>
      <View style={styles.authorRow}>
        <Image
          source={story.authorAvatarSource}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.authorCopy}>
          <Text style={styles.authorName}>{story.authorName}</Text>
          <Text style={styles.authorTime}>
            {formatRelativeTime(
              story.createdAt,
              (count) => t("home.similarStories.daysAgo", { count }),
              (count) => t("home.similarStories.monthsAgo", { count })
            )}
          </Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{story.categoryName}</Text>
        </View>
      </View>

      <View style={styles.imageWrap}>
        <Image source={cover} style={styles.coverImage} contentFit="cover" />
        <View style={styles.matchBadge}>
          <Ionicons name="sparkles" size={12} color="#E6A23B" />
          <Text style={styles.matchBadgeText}>
            AI Match {story.matchScore}%
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{story.title}</Text>
      <Text style={styles.preview} numberOfLines={3}>
        {story.contentPreview}
      </Text>

      <View style={styles.tagsRow}>
        {story.tags.map((tag) => (
          <View key={`${story.postId}-${tag}`} style={styles.tagChip}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.actionGroup}>
          <Ionicons
            name={story.isLiked ? "heart" : "heart-outline"}
            size={18}
            color={story.isLiked ? "#E56B8A" : MUTED}
          />
          <Text style={styles.actionCount}>{story.likesCount}</Text>
        </View>
        <View style={styles.actionGroup}>
          <Ionicons name="chatbubble-outline" size={17} color={MUTED} />
          <Text style={styles.actionCount}>{story.commentsCount}</Text>
        </View>
        <View style={styles.actionSpacer} />
        <Ionicons
          name={story.isBookmarked ? "bookmark" : "bookmark-outline"}
          size={18}
          color={MUTED}
        />
        <Ionicons name="share-outline" size={18} color={MUTED} />
      </View>
    </View>
  );
}

export default function CommunityScreen() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [sort, setSort] = useState<SortKey>("LATEST");
  const [sortOpen, setSortOpen] = useState(false);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "ALL", label: t("community.filters.all") },
    { key: "COUNSEL", label: t("community.filters.counsel") },
    { key: "KNOWLEDGE", label: t("community.filters.knowledge") },
  ];

  const posts = useMemo(() => {
    const filtered =
      filter === "ALL"
        ? MOCK_SIMILAR_STORIES
        : MOCK_SIMILAR_STORIES.filter((post) => post.categoryCode === filter);

    return [...filtered].sort((a, b) => {
      if (sort === "POPULAR") {
        return b.likesCount - a.likesCount;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filter, sort]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>{t("community.title")}</Text>
          <Text style={styles.headerSubtitle}>{t("community.subtitle")}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("community.addPost")}
          onPress={() => router.push("/community/add-post" as Href)}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.filterPills}>
          {filters.map((item) => {
            const selected = filter === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[
                  styles.filterPill,
                  selected ? styles.filterPillSelected : styles.filterPillIdle,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    selected && styles.filterPillTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={() => setSortOpen(true)}
          style={styles.sortButton}
        >
          <Text style={styles.sortButtonText}>
            {sort === "LATEST"
              ? t("community.sort.latest")
              : t("community.sort.popular")}
          </Text>
          <Ionicons name="chevron-down" size={14} color={TEXT} />
        </Pressable>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.postId)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <CommunityPostCard story={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t("community.empty")}</Text>
        }
      />

      <Modal
        transparent
        visible={sortOpen}
        animationType="fade"
        onRequestClose={() => setSortOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSortOpen(false)}>
          <View style={styles.sortSheet}>
            {(["LATEST", "POPULAR"] as SortKey[]).map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setSort(option);
                  setSortOpen(false);
                }}
                style={styles.sortOption}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sort === option && styles.sortOptionTextActive,
                  ]}
                >
                  {option === "LATEST"
                    ? t("community.sort.latest")
                    : t("community.sort.popular")}
                </Text>
                {sort === option ? (
                  <Ionicons name="checkmark" size={18} color={PRIMARY} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    color: TEXT,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    color: MUTED,
    fontSize: 14,
    lineHeight: 20,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  filterPills: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  filterPillSelected: {
    backgroundColor: PRIMARY,
  },
  filterPillIdle: {
    backgroundColor: "#ECEAF3",
  },
  filterPillText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "600",
  },
  filterPillTextSelected: {
    color: "#FFFFFF",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#ECEAF3",
  },
  sortButtonText: {
    color: TEXT,
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 14,
  },
  emptyText: {
    color: MUTED,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    shadowColor: "#1A1238",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BADGE_BG,
  },
  authorCopy: {
    flex: 1,
    gap: 2,
  },
  authorName: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "700",
  },
  authorTime: {
    color: MUTED,
    fontSize: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: BADGE_BG,
  },
  categoryText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "700",
  },
  imageWrap: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#EEEAF8",
  },
  coverImage: {
    width: "100%",
    height: 180,
  },
  matchBadge: {
    position: "absolute",
    left: 10,
    bottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  matchBadgeText: {
    color: TEXT,
    fontSize: 11,
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
    lineHeight: 20,
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  tagChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(138,107,232,0.28)",
  },
  tagText: {
    color: PRIMARY,
    fontSize: 12,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionCount: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "600",
  },
  actionSpacer: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(20,16,40,0.28)",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  sortSheet: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 8,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sortOptionText: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "600",
  },
  sortOptionTextActive: {
    color: PRIMARY,
  },
  pressed: {
    opacity: 0.88,
  },
});

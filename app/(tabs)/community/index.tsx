import { CommunityPostCard } from "@/components/community/CommunityPostCard";
import { AppText } from "@/components/ui/AppText";
import { useCommunityPosts } from "@/hooks/community/useCommunityPosts";
import type { CommunityCategory, CommunitySort } from "@/types/community";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const INK = "#1C1C1E";
const SECONDARY = "#8E8E93";
const BG = "#FFFFFF";
const CARD = "#FFFFFF";
const BORDER = "#E5E5EA";
const SEARCH_BG = "#F7F7F8";
const SEPARATOR = "#C6C6C8";
const PRIMARY = "#8a6be8";

type FilterKey = "ALL" | CommunityCategory;
type SortKey = CommunitySort;

export default function CommunityScreen() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [sort, setSort] = useState<SortKey>("LATEST");
  const [sortOpen, setSortOpen] = useState(false);
  const [search, setSearch] = useState("");

  const listParams = useMemo(
    () => ({
      ...(filter === "ALL" ? {} : { categoryCode: filter }),
      sort,
      size: 20,
    }),
    [filter, sort]
  );

  const postsQuery = useCommunityPosts(listParams);
  const posts = useMemo(() => {
    const all =
      postsQuery.data?.pages.flatMap((page) => page.data.content) ?? [];
    const query = search.trim().toLowerCase();
    if (!query) {
      return all;
    }
    return all.filter((post) =>
      (post.content ?? "").toLowerCase().includes(query)
    );
  }, [postsQuery.data, search]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "ALL", label: t("community.filters.all") },
    { key: "COUNSEL", label: t("community.filters.counsel") },
    { key: "KNOWLEDGE", label: t("community.filters.knowledge") },
  ];

  const handlePostPress = (postId: number) => {
    router.push(`/(tabs)/community/post/${postId}` as Href);
  };

  const listHeader = (
    <View style={styles.listHeader}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={SECONDARY} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t("community.searchPlaceholder")}
          placeholderTextColor={SECONDARY}
          style={styles.searchInput}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
      <AppText weight="bold" style={styles.sectionTitle}>
        {t("community.latestPosts")}
      </AppText>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText weight="bold" style={styles.headerSmallsub}>
            Together, gently
          </AppText>
          <AppText weight="bold" style={styles.headerTitle}>
            {t("community.title")}
          </AppText>
          <AppText weight="regular" style={styles.headerSubtitle}>
            {t("community.subtitle")}
          </AppText>

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
          <Ionicons name="add" size={24} color={CARD} />
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        <View style={styles.chipRow}>
          {filters.map((item) => {
            const selected = filter === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[
                  styles.chip,
                  selected ? styles.chipSelected : styles.chipIdle,
                ]}
              >
                <AppText
                  weight={selected ? "semibold" : "medium"}
                  style={[
                    styles.chipText,
                    selected && styles.chipTextSelected,
                  ]}
                >
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("community.sort.latest")}
          onPress={() => setSortOpen(true)}
          style={({ pressed }) => [
            styles.filterIconButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="options-outline" size={18} color={INK} />
        </Pressable>
      </View>

      {postsQuery.isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={INK} />
          <AppText weight="medium" style={styles.stateText}>
            {t("community.loading")}
          </AppText>
        </View>
      ) : postsQuery.isError ? (
        <View style={styles.stateBox}>
          <AppText weight="medium" style={styles.stateText}>
            {t("community.error")}
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void postsQuery.refetch();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
            ]}
          >
            <AppText weight="semibold" style={styles.retryText}>
              {postsQuery.isFetching
                ? t("community.loading")
                : t("community.retry")}
            </AppText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.postId)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={listHeader}
          refreshing={postsQuery.isRefetching}
          onRefresh={() => {
            void postsQuery.refetch();
          }}
          onEndReached={() => {
            if (postsQuery.hasNextPage && !postsQuery.isFetchingNextPage) {
              void postsQuery.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <CommunityPostCard
              post={item}
              onPress={() => handlePostPress(item.postId)}
            />
          )}
          ListEmptyComponent={
            <AppText weight="regular" style={styles.emptyText}>
              {t("community.empty")}
            </AppText>
          }
          ListFooterComponent={
            postsQuery.isFetchingNextPage ? (
              <View style={styles.nextPageBox}>
                <ActivityIndicator color={INK} />
              </View>
            ) : null
          }
        />
      )}

      <Modal
        transparent
        visible={sortOpen}
        animationType="fade"
        onRequestClose={() => setSortOpen(false)}
      >
        <Pressable
          style={styles.sheetBackdrop}
          onPress={() => setSortOpen(false)}
        >
          <View style={styles.sortSheet}>
            {(["LATEST", "POPULAR"] as SortKey[]).map((option, index) => (
              <Pressable
                key={option}
                onPress={() => {
                  setSort(option);
                  setSortOpen(false);
                }}
                style={[
                  styles.sortOption,
                  index > 0 && styles.sortOptionBorder,
                ]}
              >
                <AppText
                  weight={sort === option ? "semibold" : "regular"}
                  style={[
                    styles.sortOptionText,
                    sort === option && styles.sortOptionTextActive,
                  ]}
                >
                  {option === "LATEST"
                    ? t("community.sort.latest")
                    : t("community.sort.popular")}
                </AppText>
                {sort === option ? (
                  <Ionicons name="checkmark" size={18} color={INK} />
                ) : null}
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={() => setSortOpen(false)}
              style={({ pressed }) => [
                styles.sortCancel,
                pressed && styles.pressed,
              ]}
            >
              <AppText weight="semibold" style={styles.sortCancelText}>
                {t("community.detail.cancel")}
              </AppText>
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
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
    paddingRight: 8,
  },
  headerTitle: {
    color: INK,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    color: SECONDARY,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: INK,
    marginTop: 2,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  chipRow: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  chipSelected: {
    backgroundColor: INK,
  },
  chipIdle: {
    backgroundColor: CARD,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  chipText: {
    color: INK,
    fontSize: 14,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#FFFFFF",
  },
  filterIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CARD,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  listHeader: {
    gap: 18,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: SEARCH_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      default: {},
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: INK,
    paddingVertical: 12,
  },
  sectionTitle: {
    color: INK,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 16,
    flexGrow: 1,
  },
  emptyText: {
    color: SECONDARY,
    fontSize: 15,
    textAlign: "center",
    marginTop: 48,
  },
  nextPageBox: {
    paddingVertical: 16,
    alignItems: "center",
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
    backgroundColor: SEARCH_BG,
  },
  retryText: {
    color: INK,
    fontSize: 15,
    fontWeight: "600",
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.32)",
    justifyContent: "flex-end",
    paddingHorizontal: 12,
    paddingBottom: 28,
  },
  sortSheet: {
    backgroundColor: CARD,
    borderRadius: 14,
    overflow: "hidden",
  },
  sortOption: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  sortOptionBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SEPARATOR,
  },
  sortOptionText: {
    color: INK,
    fontSize: 17,
  },
  sortOptionTextActive: {
    fontWeight: "600",
  },
  sortCancel: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: SEPARATOR,
  },
  sortCancelText: {
    color: INK,
    fontSize: 17,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
  headerSmallsub:{
    color: PRIMARY
  },
  headerSmallsubText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: "900",
  },
});

import { CommunityPostCard } from "@/components/community/CommunityPostCard";
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
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEXT = "#2A2A6A";
const MUTED = "#7A7596";
const PRIMARY = "#8A6BE8";
const SCREEN_BG = "#F7F5FB";

type FilterKey = "ALL" | CommunityCategory;
type SortKey = CommunitySort;

export default function CommunityScreen() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [sort, setSort] = useState<SortKey>("LATEST");
  const [sortOpen, setSortOpen] = useState(false);

  const listParams = useMemo(
    () => ({
      ...(filter === "ALL" ? {} : { categoryCode: filter }),
      sort,
      page: 0,
      size: 20,
    }),
    [filter, sort]
  );

  const postsQuery = useCommunityPosts(listParams);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "ALL", label: t("community.filters.all") },
    { key: "COUNSEL", label: t("community.filters.counsel") },
    { key: "KNOWLEDGE", label: t("community.filters.knowledge") },
  ];

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

      {postsQuery.isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={PRIMARY} />
          <Text style={styles.stateText}>{t("community.loading")}</Text>
        </View>
      ) : postsQuery.isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{t("community.error")}</Text>
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
            <Text style={styles.retryText}>
              {postsQuery.isFetching
                ? t("community.loading")
                : t("community.retry")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={postsQuery.data ?? []}
          keyExtractor={(item) => String(item.postId)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={postsQuery.isRefetching}
          onRefresh={() => {
            void postsQuery.refetch();
          }}
          renderItem={({ item }) => <CommunityPostCard post={item} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{t("community.empty")}</Text>
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
          style={styles.modalBackdrop}
          onPress={() => setSortOpen(false)}
        >
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
    flexGrow: 1,
  },
  emptyText: {
    color: MUTED,
    textAlign: "center",
    marginTop: 40,
  },
  stateBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  stateText: {
    color: MUTED,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#ECEAF3",
  },
  retryText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: "700",
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

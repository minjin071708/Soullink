import { useUpdateCommunityPost } from "@/hooks/community/useCommunityPosts";
import { useCommunityPostsDetail } from "@/hooks/community/useCommunityPostsDetail";
import type { CommunityCategory } from "@/types/community";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TEXT = "#1C1C1E";
const MUTED = "#8E8E93";
const ACCENT = "#8A6BE8";
const BG = "#F2F2F7";
const CARD = "#FFFFFF";
const MAX_STORY = 10_000;

export default function CommunityEditPostScreen() {
  const { t } = useTranslation();
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const resolvedPostId = Array.isArray(postId) ? postId[0] : postId;
  const detailQuery = useCommunityPostsDetail(resolvedPostId);
  const updatePost = useUpdateCommunityPost(resolvedPostId);

  const [category, setCategory] = useState<CommunityCategory>("COUNSEL");
  const [story, setStory] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!detailQuery.data || hydrated) {
      return;
    }
    setCategory(detailQuery.data.categoryCode);
    setStory(detailQuery.data.content ?? "");
    setHydrated(true);
  }, [detailQuery.data, hydrated]);

  const canSubmit = useMemo(
    () => story.trim().length > 0 && !updatePost.isPending && hydrated,
    [hydrated, story, updatePost.isPending]
  );

  const handleSave = () => {
    if (!canSubmit) {
      return;
    }

    updatePost.mutate(
      {
        content: story.trim(),
        categoryCode: category,
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: () => {
          Alert.alert(
            t("community.detail.editTitle"),
            t("community.detail.saveError")
          );
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.nav}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT} />
        </Pressable>
        <Text style={styles.navTitle}>{t("community.detail.editTitle")}</Text>
        <View style={styles.navSpacer} />
      </View>

      {detailQuery.isLoading || !hydrated ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : detailQuery.isError ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>{t("community.detail.error")}</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>{t("community.add.categoryTitle")}</Text>
            <View style={styles.categoryRow}>
              {(["COUNSEL", "KNOWLEDGE"] as CommunityCategory[]).map(
                (option) => {
                  const selected = category === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setCategory(option)}
                      style={[
                        styles.categoryChip,
                        selected && styles.categoryChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          selected && styles.categoryChipTextSelected,
                        ]}
                      >
                        {option === "COUNSEL"
                          ? t("community.filters.counsel")
                          : t("community.filters.knowledge")}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>

            <Text style={styles.label}>{t("community.add.storyTitle")}</Text>
            <View style={styles.storyBox}>
              <TextInput
                value={story}
                onChangeText={(value) => setStory(value.slice(0, MAX_STORY))}
                placeholder={t("community.add.storyPlaceholder")}
                placeholderTextColor={MUTED}
                multiline
                textAlignVertical="top"
                style={styles.storyInput}
              />
              <Text style={styles.counter}>
                {story.length.toLocaleString()}/{MAX_STORY.toLocaleString()}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveButton,
                !canSubmit && styles.saveDisabled,
                pressed && canSubmit && styles.pressed,
              ]}
            >
              {updatePost.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveText}>{t("community.detail.save")}</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  flex: {
    flex: 1,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    minHeight: 44,
  },
  navButton: {
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  label: {
    marginBottom: 10,
    fontSize: 13,
    fontWeight: "600",
    color: TEXT,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 22,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: CARD,
  },
  categoryChipSelected: {
    backgroundColor: ACCENT,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT,
  },
  categoryChipTextSelected: {
    color: "#FFFFFF",
  },
  storyBox: {
    minHeight: 220,
    borderRadius: 16,
    backgroundColor: CARD,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  storyInput: {
    minHeight: 170,
    fontSize: 17,
    lineHeight: 24,
    color: TEXT,
  },
  counter: {
    textAlign: "right",
    fontSize: 12,
    color: MUTED,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  saveButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  saveDisabled: {
    opacity: 0.45,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  stateBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  stateText: {
    color: MUTED,
    fontSize: 15,
  },
  pressed: {
    opacity: 0.7,
  },
});

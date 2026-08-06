import { useAddCommunityPost } from "@/hooks/community/useCommunityPosts";
import type { CommunityCategory } from "@/types/community";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useMemo, useState } from "react";
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

const TEXT = "#2A2A6A";
const MUTED = "#7A7596";
const PRIMARY = "#8A6BE8";
const BADGE_BG = "#F5F0FF";
const MAX_STORY = 10_000;
const MAX_IMAGES = 5;

type PickedImage = {
  uri: string;
  name: string;
  type: string;
};

export default function CommunityAddPostScreen() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<CommunityCategory>("COUNSEL");
  const [story, setStory] = useState("");
  const [images, setImages] = useState<PickedImage[]>([]);
  const { mutate: addPost, isPending } = useAddCommunityPost();

  // Gate submit until required fields are filled (and not already posting).
  const canSubmit = useMemo(
    () => story.trim().length > 0 && !isPending,
    [isPending, story]
  );

  const pickImages = async () => {
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const picked = result.assets.slice(0, remaining).map((asset, index) => ({
      uri: asset.uri,
      name: asset.fileName ?? `community-${Date.now()}-${index}.jpg`,
      type: asset.mimeType ?? "image/jpeg",
    }));

    setImages((prev) => [...prev, ...picked].slice(0, MAX_IMAGES));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    addPost(
      {
        content: story.trim(),
        categoryCode: category,
        imageSortOrders: images.map((_, index) => index),
        images,
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: () => {
          Alert.alert(
            t("community.addPostTitle"),
            t("community.add.submitError", {
              defaultValue: "Could not create the post. Please try again.",
            })
          );
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={TEXT} />
        </Pressable>
        <Text style={styles.topTitle}>{t("community.addPostTitle")}</Text>
        <View style={styles.topSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>
            {t("community.add.categoryTitle")}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {t("community.add.categorySubtitle")}
          </Text>

          <View style={styles.categoryRow}>
            <Pressable
              onPress={() => setCategory("COUNSEL")}
              style={[
                styles.categoryCard,
                category === "COUNSEL" && styles.categoryCardSelected,
              ]}
            >
              {category === "COUNSEL" ? (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              ) : null}
              <View
                style={[styles.categoryIconWrap, { backgroundColor: BADGE_BG }]}
              >
                <Ionicons name="heart" size={20} color={PRIMARY} />
              </View>
              <Text style={styles.categoryTitle}>
                {t("community.filters.counsel")}
              </Text>
              <Text style={styles.categoryBody}>
                {t("community.add.counselDesc")}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setCategory("KNOWLEDGE")}
              style={[
                styles.categoryCard,
                category === "KNOWLEDGE" && styles.categoryCardSelected,
              ]}
            >
              {category === "KNOWLEDGE" ? (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              ) : null}
              <View
                style={[
                  styles.categoryIconWrap,
                  { backgroundColor: "#FFF6E5" },
                ]}
              >
                <Ionicons name="bulb" size={20} color="#E6A23B" />
              </View>
              <Text style={styles.categoryTitle}>
                {t("community.filters.knowledge")}
              </Text>
              <Text style={styles.categoryBody}>
                {t("community.add.knowledgeDesc")}
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>
            {t("community.add.storyTitle")}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {t("community.add.storySubtitle")}
          </Text>
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

          <Text style={styles.sectionTitle}>
            {t("community.add.imagesTitle")}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {t("community.add.imagesSubtitle")}
          </Text>
          <View style={styles.imageRow}>
            {images.map((image, index) => (
              <Pressable
                key={`${image.uri}-${index}`}
                accessibilityRole="button"
                accessibilityLabel={t("community.add.removeImage", {
                  defaultValue: "Remove image",
                })}
                onPress={() => removeImage(index)}
                style={styles.imageSlot}
              >
                <Image
                  source={{ uri: image.uri }}
                  style={styles.imageThumb}
                  contentFit="cover"
                />
                <View style={styles.removeBadge}>
                  <Ionicons name="close" size={12} color="#FFFFFF" />
                </View>
              </Pressable>
            ))}

            {images.length < MAX_IMAGES ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("community.add.addImage", {
                  defaultValue: "Add image",
                })}
                onPress={() => {
                  void pickImages();
                }}
                style={styles.imageSlot}
              >
                <Ionicons name="add" size={22} color={MUTED} />
              </Pressable>
            ) : null}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            disabled={!canSubmit}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitButton,
              !canSubmit && styles.submitDisabled,
              pressed && canSubmit && styles.pressed,
            ]}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                <Text style={styles.submitText}>
                  {t("community.add.submit")}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    flex: 1,
    textAlign: "center",
    color: TEXT,
    fontSize: 17,
    fontWeight: "700",
  },
  topSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    marginTop: 18,
  },
  sectionSubtitle: {
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: "row",
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E6E2F0",
    padding: 14,
    gap: 8,
    position: "relative",
  },
  categoryCardSelected: {
    borderColor: PRIMARY,
    backgroundColor: "#FBFAFF",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTitle: {
    color: TEXT,
    fontSize: 15,
    fontWeight: "800",
  },
  categoryBody: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 17,
  },
  storyBox: {
    borderWidth: 1,
    borderColor: "#E6E2F0",
    borderRadius: 16,
    minHeight: 140,
    padding: 12,
  },
  storyInput: {
    minHeight: 100,
    color: TEXT,
    fontSize: 15,
    lineHeight: 22,
  },
  counter: {
    alignSelf: "flex-end",
    color: MUTED,
    fontSize: 12,
    marginTop: 6,
  },
  imageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  imageSlot: {
    width: 58,
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E2F0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFC",
    overflow: "hidden",
  },
  imageThumb: {
    width: "100%",
    height: "100%",
  },
  removeBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(42,42,106,0.7)",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#EDEAF5",
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitDisabled: {
    opacity: 0.45,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.9,
  },
});

import { useEmotionTags } from "@/hooks/useEmotionTags";
import type { EmotionTag } from "@/schemas/emotionTagSchema";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PRIMARY = "#8A6BE8";
const TITLE = "#2A2A6A";
const MUTED = "#8B8BA3";
const CHIP_BORDER = "#E6E3F2";
const SELECTED_BG = "#F0EAFE";

type CauseTagsSectionProps = {
  selectedTagIds: number[];
  onChange: (next: number[]) => void;
};

export function CauseTagsSection({
  selectedTagIds,
  onChange,
}: CauseTagsSectionProps) {
  const { t } = useTranslation();
  const tagsQuery = useEmotionTags("CAUSE");

  const tags = useMemo(() => {
    const list = tagsQuery.data ?? [];
    return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [tagsQuery.data]);

  const toggleTag = (tagId: number) => {
    onChange(
      selectedTagIds.includes(tagId)
        ? selectedTagIds.filter((id) => id !== tagId)
        : [...selectedTagIds, tagId]
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("journal.write.tags.title")}</Text>
      <Text style={styles.subtitle}>{t("journal.write.tags.subtitle")}</Text>

      {tagsQuery.isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={PRIMARY} />
        </View>
      ) : null}

      {tagsQuery.isError ? (
        <View style={styles.loadingBox}>
          <Text style={styles.errorText}>{t("journal.write.tags.error")}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              void tagsQuery.refetch();
            }}
            style={({ pressed }) => [
              styles.retryChip,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.retryText}>{t("journal.write.tags.retry")}</Text>
          </Pressable>
        </View>
      ) : null}

      {!tagsQuery.isLoading && !tagsQuery.isError ? (
        <View style={styles.tagList}>
          {tags.map((tag) => (
            <TagChip
              key={tag.tagId}
              tag={tag}
              selected={selectedTagIds.includes(tag.tagId)}
              onPress={() => toggleTag(tag.tagId)}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.hintRow}>
        <Ionicons name="information-circle-outline" size={16} color={MUTED} />
        <Text style={styles.hintText}>{t("journal.write.tags.multiHint")}</Text>
      </View>
    </View>
  );
}

function TagChip({
  tag,
  selected,
  onPress,
}: {
  tag: EmotionTag;
  selected: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const label = t(`emotionTags.${tag.tagCode}`, {
    defaultValue: tag.tagName,
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tagChip,
        selected ? styles.tagChipSelected : styles.tagChipDefault,
        pressed && styles.pressed,
      ]}
    >
      {selected ? (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        </View>
      ) : null}
      <Text
        style={[
          styles.tagText,
          selected ? styles.tagTextSelected : styles.tagTextDefault,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: "#C9B8E8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 3,
  },
  title: {
    color: TITLE,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    color: MUTED,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  loadingBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  errorText: {
    color: MUTED,
    fontSize: 13,
    textAlign: "center",
  },
  retryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: SELECTED_BG,
  },
  retryText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "700",
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tagChipDefault: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: CHIP_BORDER,
  },
  tagChipSelected: {
    backgroundColor: SELECTED_BG,
    borderWidth: 0,
  },
  checkBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
  },
  tagText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "600",
  },
  tagTextDefault: {
    color: TITLE,
  },
  tagTextSelected: {
    color: PRIMARY,
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  hintText: {
    flex: 1,
    flexShrink: 1,
    color: MUTED,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.88,
  },
});

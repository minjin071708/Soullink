import { MOODS } from "@/constants/moods";
import type { MoodId } from "@/types/moodType";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

const CARD_BG = "#FFFFFF";
const CARD_BORDER = "rgba(138,107,232,0.12)";
const SELECTED_BORDER = "#A884FF";
const SELECTED_FILL = "#A884FF";
const TITLE_COLOR = "#2A2A6A";
const MUTED = "#7D8097";

const MOOD_CARD_COLORS: Record<MoodId, { tint: string; glow: string }> = {
  ANGRY: { tint: "#fff0f0", glow: "#F0E5FF" },
  ANXIOUS: { tint: "#F1F6FF", glow: "#E7F0FF" },
  CALM: { tint: "#f4fffe", glow: "#EEE7FF" },
  HAPPY: { tint: "#FFF8E8", glow: "#FFF0C7" },
  SAD: { tint: "#F1F6FF", glow: "#E7F0FF" },
  TIRED: { tint: "#f0fcf3", glow: "#F4E7FF" },
};

type MoodPickerProps = {
  onSelect: (mood: MoodId) => void;
  title?: string;
  selectedMoodId?: MoodId;
  showTitle?: boolean;
};

export function MoodPicker({
  onSelect,
  title,
  selectedMoodId,
  showTitle = true,
}: MoodPickerProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {showTitle ? (
        <Text style={styles.title}>{title ?? t("home.howAreYouFeeling")}</Text>
      ) : null}

      <View style={styles.cardList}>
        {MOODS.map((mood) => {
          const isSelected = mood.id === selectedMoodId;
          const cardColors = MOOD_CARD_COLORS[mood.id];

          return (
            <Pressable
              key={mood.id}
              accessibilityRole="button"
              accessibilityLabel={t(mood.labelKey)}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(mood.id)}
              style={({ pressed }) => [
                styles.card,
                {
                  borderColor: isSelected ? SELECTED_BORDER : CARD_BORDER,
                  shadowColor: isSelected ? "#B191FF" : "#31285F",
                  shadowOpacity: isSelected ? 0.14 : 0.06,
                },
                pressed && styles.cardPressed,
              ]}
            >
              <View
                style={[
                  styles.leadingOrb,
                  { backgroundColor: cardColors.glow },
                ]}
              >
                <View
                  style={[
                    styles.leadingTint,
                    { backgroundColor: cardColors.tint },
                  ]}
                />
                <Image
                  source={mood.image}
                  style={styles.moodImage}
                  contentFit="contain"
                />
              </View>

              <View style={styles.textBlock}>
                <Text style={styles.moodTitle}>{t(mood.labelKey)}</Text>
                <Text style={styles.moodSubtitle}>
                  {t(`journal.mood.options.${mood.id}.subtitle`)}
                </Text>
              </View>

              <View
                style={[
                  styles.trailingCircle,
                  {
                    borderColor: isSelected ? SELECTED_FILL : "#A884FF",
                    backgroundColor: isSelected ? SELECTED_FILL : "transparent",
                  },
                ]}
              >
                <Ionicons
                  name={isSelected ? "checkmark" : "chevron-forward"}
                  size={isSelected ? 22 : 20}
                  color={isSelected ? "#FFFFFF" : "#7F58E7"}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: 24,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.3,
    color: TITLE_COLOR,
  },
  cardList: {
    gap: 16,
  },
  card: {
    minHeight: 136,
    borderRadius: 24,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
  },
  leadingOrb: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: 16,
  },
  leadingTint: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 38,
  },
  moodImage: {
    width: 76,
    height: 76,
  },
  textBlock: {
    flex: 1,
    paddingRight: 12,
  },
  moodTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: "800",
    marginBottom: 4,
    letterSpacing: -0.4,
    color: TITLE_COLOR,
  },
  moodSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: MUTED,
  },
  trailingCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
});

import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

const MASCOT = require("@/assets/images/hellomascot2.png");

const TITLE = "#302060";
const MUTED = "#706784";
const PRIMARY_BTN = "#B3A6F2";
const BADGE_BG = "#EDE7FF";
const CHECK_BG = "#8A6BE8";

function parseDiaryIdParam(
  value: string | string[] | undefined
): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return undefined;
  }

  const diaryId = Number(raw);
  return Number.isInteger(diaryId) && diaryId > 0 ? diaryId : undefined;
}

export default function JournalSuccessScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ diaryId?: string | string[] }>();
  const diaryId = parseDiaryIdParam(params.diaryId);

  const goHome = () => {
    router.replace("/(tabs)");
  };

  const viewAnalysis = () => {
    if (diaryId === undefined) {
      goHome();
      return;
    }

    router.replace({
      pathname: "/journal/result",
      params: { diaryId: String(diaryId) },
    });
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#DDE4FF", "#F3ECFF", "#FFF6F2"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.starField} pointerEvents="none">
        <Text style={[styles.star, styles.star1]}>✦</Text>
        <Text style={[styles.star, styles.star2]}>✧</Text>
        <Text style={[styles.star, styles.star3]}>✦</Text>
        <Text style={[styles.star, styles.star4]}>✧</Text>
        <Text style={[styles.star, styles.star5]}>✦</Text>
        <Text style={[styles.star, styles.star6]}>✧</Text>
      </View>

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.content}>
          <View style={styles.badge}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={14} color="#FFFFFF" />
            </View>
            <Text style={styles.badgeText}>
              {t("journal.success.successBadge")}
            </Text>
          </View>

          <Text style={styles.title}>{t("journal.success.successTitle")}</Text>
          <Text style={styles.description}>
            {t("journal.success.successDescription")}
          </Text>

          <View style={styles.mascotWrap}>
            <Image
              source={MASCOT}
              style={styles.mascot}
              contentFit="contain"
              accessible={false}
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("journal.success.viewAnalysis")}
            onPress={viewAnalysis}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {t("journal.success.viewAnalysis")}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("journal.success.backToHome")}
            onPress={goHome}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>
              {t("journal.success.backToHome")}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F3ECFF",
  },
  safe: {
    flex: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 36,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: BADGE_BG,
    marginBottom: 20,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CHECK_BG,
  },
  badgeText: {
    color: TITLE,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
  },
  title: {
    color: TITLE,
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  description: {
    color: MUTED,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  mascotWrap: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 8,
  },
  mascot: {
    width: 260,
    height: 260,
  },
  footer: {
    gap: 14,
    paddingBottom: 12,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: PRIMARY_BTN,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: TITLE,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
  starField: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: "absolute",
    fontSize: 14,
    opacity: 0.7,
  },
  star1: { top: "12%", left: "12%", color: "#F0C96A", fontSize: 16 },
  star2: { top: "18%", right: "16%", color: "#F2A8C4", fontSize: 12 },
  star3: { top: "28%", left: "22%", color: "#B7A6F2", fontSize: 11 },
  star4: { top: "22%", right: "28%", color: "#F0C96A", fontSize: 10 },
  star5: { top: "36%", right: "12%", color: "#F2A8C4", fontSize: 13 },
  star6: { top: "40%", left: "10%", color: "#C4B6F5", fontSize: 12 },
});

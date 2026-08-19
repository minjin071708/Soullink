import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MASCOT = require("@/assets/mascotImages/sumbitMascot.png");

const COLORS = {
  background: "#F7F8F4",
  card: "#FFFFFF",
  text: "#1C1C1E",
  secondaryText: "#6E746B",
  darkGreen: "#364A31",
  blue: "#7388F2",
  teal: "#2A9179",
  border: "#E7EAE4",
  buttonText: "#FFFFFF",
} as const;

export default function JournalSuccessScreen() {
  const router = useRouter();

  const goHome = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.root}>
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
      >
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Ionicons
              name="checkmark"
              size={30}
              color={COLORS.buttonText}
            />
          </View>

          <Text style={styles.badgeText}>
            Тэмдэглэл хадгалагдлаа
          </Text>

          <Text style={styles.title}>
            Өөртөө цаг гаргаснаар{"\n"}
            нэг алхам урагшиллаа
          </Text>

          <Text style={styles.description}>
            Өнөөдрийн мэдрэмжийг тань аюулгүй хадгаллаа.
          </Text>

          <View style={styles.mascotContainer}>
            <View style={styles.mascotGlow} />

            <Image
              source={MASCOT}
              style={styles.mascot}
              contentFit="contain"
              accessible={false}
            />
          </View>

          <View style={styles.analysisNotice}>
            <View style={styles.noticeIcon}>
              <Ionicons
                name="notifications-outline"
                size={21}
                color={COLORS.blue}
              />
            </View>

            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>
                AI шинжилгээг боловсруулж байна
              </Text>

              <Text style={styles.noticeDescription}>
                Шинжилгээ бэлэн болмогц танд мэдэгдэл илгээнэ.
                Энэ нь 1 секундээс 5 минут хүртэл үргэлжилж болно.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Нүүр хуудас руу буцах"
            onPress={goHome}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              Нүүр хуудас руу буцах
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
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },

  successIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.teal,
    marginBottom: 14,
    shadowColor: COLORS.teal,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },

  badgeText: {
    color: COLORS.teal,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  title: {
    maxWidth: 330,
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
    marginBottom: 10,
  },

  description: {
    maxWidth: 310,
    color: COLORS.secondaryText,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "500",
    textAlign: "center",
  },

  mascotContainer: {
    width: 230,
    height: 230,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },

  mascotGlow: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#EDF0FF",
  },

  mascot: {
    width: 220,
    height: 220,
  },

  analysisNotice: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 13,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.card,
  },

  noticeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDF0FF",
  },

  noticeContent: {
    flex: 1,
    gap: 4,
  },

  noticeTitle: {
    color: COLORS.darkGreen,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },

  noticeDescription: {
    color: COLORS.secondaryText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },

  footer: {
    paddingTop: 12,
    paddingBottom: 8,
  },

  primaryButton: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: COLORS.darkGreen,
  },

  primaryButtonText: {
    color: COLORS.buttonText,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
  },

  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
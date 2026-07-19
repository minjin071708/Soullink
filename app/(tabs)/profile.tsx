import { useLogout } from "@/hooks/auth/useLogout";
import { useAuthStore } from "@/store/authStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_BG = "#F7F8FC";
const TITLE_COLOR = "#27265E";
const MUTED = "#8B8FA8";
const PRIMARY = "#8A6BE8";
const ICON_BG = "#F0EAFF";
const LOGOUT = "#E0567A";
const LOGOUT_BG = "#FDE8EE";
const LANGUAGE_HREF = "/(onboarding)/language" as Href;

type MenuIcon = keyof typeof Ionicons.glyphMap;

type MenuItem = {
  key: string;
  labelKey:
    | "profile.editProfile"
    | "profile.settings"
    | "profile.notifications"
    | "profile.language"
    | "profile.biometricLogin";
  icon: MenuIcon;
  onPress?: () => void;
};

export default function Profile() {
  const { t } = useTranslation();
  const member = useAuthStore((state) => state.member);
  const { mutate: logout, isPending } = useLogout();

  const displayName =
    member?.nickname?.trim() ||
    member?.memberId?.trim() ||
    t("home.friend");

  const menuItems: MenuItem[] = [
    {
      key: "edit",
      labelKey: "profile.editProfile",
      icon: "person-outline",
    },
    {
      key: "settings",
      labelKey: "profile.settings",
      icon: "settings-outline",
    },
    {
      key: "notifications",
      labelKey: "profile.notifications",
      icon: "notifications-outline",
    },
    {
      key: "language",
      labelKey: "profile.language",
      icon: "globe-outline",
      onPress: () => router.push(LANGUAGE_HREF),
    },
    {
      key: "biometric",
      labelKey: "profile.biometricLogin",
      icon: "finger-print-outline",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t("profile.title")}</Text>

        <LinearGradient
          colors={["#FFE6EF", "#F3E9FF", "#F7F8FC"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.profileRow}>
            <View style={styles.avatarRing}>
              <Image
                source={require("@/assets/mascotImages/happy.png")}
                style={styles.avatar}
                contentFit="cover"
              />
            </View>

            <View style={styles.profileText}>
              <Text style={styles.userName} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.tagline}>{t("profile.tagline")}</Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("profile.edit")}
            style={({ pressed }) => [
              styles.editFab,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="pencil" size={16} color={LOGOUT} />
          </Pressable>
        </LinearGradient>

        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityLabel={t(item.labelKey)}
              onPress={item.onPress}
              style={({ pressed }) => [
                styles.menuRow,
                index < menuItems.length - 1 && styles.menuRowBorder,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Ionicons name={item.icon} size={20} color={PRIMARY} />
                </View>
                <Text style={styles.menuLabel}>{t(item.labelKey)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#C5C8D6" />
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("profile.logout")}
          disabled={isPending}
          onPress={() => logout()}
          style={({ pressed }) => [
            styles.logoutCard,
            pressed && styles.pressed,
            isPending && styles.disabled,
          ]}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconBox, styles.logoutIconBox]}>
              <Ionicons name="exit-outline" size={20} color={LOGOUT} />
            </View>
            <Text style={styles.logoutLabel}>{t("profile.logout")}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={LOGOUT} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  title: {
    marginBottom: 18,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    letterSpacing: -0.6,
    color: TITLE_COLOR,
  },
  profileCard: {
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
    overflow: "hidden",
    minHeight: 120,
    justifyContent: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingRight: 36,
  },
  avatarRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: PRIMARY,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 68,
    height: 68,
  },
  profileText: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    color: TITLE_COLOR,
  },
  tagline: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: MUTED,
  },
  editFab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8A6BE8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 8,
    marginBottom: 14,
    shadowColor: "#27265E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  menuRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  menuRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ECECF3",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: TITLE_COLOR,
  },
  logoutCard: {
    minHeight: 64,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#27265E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  logoutIconBox: {
    backgroundColor: LOGOUT_BG,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: LOGOUT,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});

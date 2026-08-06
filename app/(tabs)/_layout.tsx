import { useAppTheme } from "@/hooks/useAppTheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as NavigationBar from "expo-navigation-bar";
import { Tabs, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_CONTENT_HEIGHT = 64;
const CREATE_BUTTON_SIZE = 58;

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useAppTheme();
  const bottomInset = Math.max(insets.bottom, 0);
  const hideTabBar = segments.some((segment) => segment === "add-post");

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    void NavigationBar.setBackgroundColorAsync(colors.tabBar);
    void NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
  }, [colors.tabBar, isDark]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarStyle: hideTabBar
          ? { display: "none" }
          : [
              styles.tabBar,
              {
                height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
                paddingBottom: bottomInset,
                backgroundColor: colors.tabBar,
                borderTopColor: colors.border,
              },
            ],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: {
          paddingTop: 6,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar-tab"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: "",
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <View
              style={[
                styles.createButton,
                {
                  backgroundColor: colors.primary,
                  shadowColor: colors.primary,
                },
              ]}
            >
              <Ionicons name="add" size={34} color="#FFFFFF" />
            </View>
          ),
          tabBarButton: ({ children }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create journal"
              onPress={() =>
                router.push({
                  pathname: "/journal/mood",
                })
              }
              style={styles.createButtonContainer}
            >
              {children}
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="insights"
        options={{
          title: "Insight",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="community"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 6,
    shadowColor: "#1A1A2E",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 12,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  createButtonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  createButton: {
    position: "absolute",
    top: -30,
    width: CREATE_BUTTON_SIZE,
    height: CREATE_BUTTON_SIZE,
    borderRadius: CREATE_BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
});

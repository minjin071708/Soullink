import { useDayNightTheme } from "@/components/day-night/DayNightProvider";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import type { PropsWithChildren } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";

type DayNightScreenBackgroundProps = PropsWithChildren<{
  /** Enable this when the background owns the screen's scrolling. */
  scroll?: boolean;
  edges?: readonly Edge[];
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

/**
 * Full-screen SoulLink day/night image background.
 * Do not use this on screens with their own art direction.
 */
export function DayNightScreenBackground({
  children,
  scroll = false,
  edges = ["top", "bottom"],
  style,
  contentContainerStyle,
}: DayNightScreenBackgroundProps) {
  const { backgroundSource, colors, statusBarStyle } = useDayNightTheme();

  const content = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentContainerStyle]}>{children}</View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }, style]}>
      <Image
        source={backgroundSource}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        accessible={false}
      />
      <StatusBar style={statusBarStyle} translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.flex} edges={edges}>
        {content}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

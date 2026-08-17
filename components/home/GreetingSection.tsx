import { useDayNightTheme } from "@/components/day-night/DayNightProvider";
import { useIsFocused } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HERO_MASCOT_DAY = require("@/assets/mascotImages/maskot3dwhite.png");
const HERO_MASCOT_NIGHT = require("@/assets/mascotImages/nightmascot3dwhite.png");

/** 4:5 hero — height ≈ width × 1.25 */
const HERO_ASPECT = 5 / 4;
const HERO_MIN_HEIGHT = 300;
const HERO_MAX_HEIGHT = 520;
const GREETING_COLOR_DAY = "#252568";
const GREETING_COLOR_NIGHT = "#F7F5FF";
const MASCOT_WIDTH_RATIO = 0.7;

export type GreetingSectionProps = {
  greeting: string;
  username?: string;
  greetingIcon?: string;
};

export function GreetingSection({
  greeting,
  username,
  greetingIcon,
}: GreetingSectionProps) {
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { backgroundSource, isNight, statusBarStyle } = useDayNightTheme();

  const heroMascot = isNight ? HERO_MASCOT_NIGHT : HERO_MASCOT_DAY;
  const greetingColor = isNight ? GREETING_COLOR_NIGHT : GREETING_COLOR_DAY;

  const heroHeight = Math.min(
    Math.max(windowWidth * HERO_ASPECT, HERO_MIN_HEIGHT),
    HERO_MAX_HEIGHT
  );
  const mascotWidth = Math.round(windowWidth * MASCOT_WIDTH_RATIO);

  return (
    <ImageBackground
      source={backgroundSource}
      style={[styles.hero, { height: heroHeight }]}
      imageStyle={styles.heroImage}
      resizeMode="cover"
      accessible={false}
      importantForAccessibility="no"
    >
      {isFocused ? (
        <StatusBar
          style={statusBarStyle}
          translucent
          backgroundColor="transparent"
        />
      ) : null}

      <View
        pointerEvents="none"
        style={[
          styles.statusBarScrim,
          { height: Math.max(insets.top, 0) },
        ]}
      />

      <View
        style={[
          styles.greetingBlock,
          { paddingTop: insets.top + 12 },
        ]}
      >
        <Text style={[styles.greetingLine, { color: greetingColor }]}>
          {greeting}
        </Text>
        {username ? (
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: greetingColor }]}>
              {username}
            </Text>
            {greetingIcon ? (
              <Text style={styles.emoji}>{greetingIcon}</Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <Image
        source={heroMascot}
        style={[
          isNight ? styles.nightMascot : styles.dayMascot,
          {
            width: mascotWidth,
            height: mascotWidth,
          },
        ]}
        resizeMode="contain"
        accessible={false}
        importantForAccessibility="no"
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: "100%",
    overflow: "hidden",
    justifyContent: "flex-start",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  statusBarScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  greetingBlock: {
    zIndex: 2,
    maxWidth: "68%",
    paddingHorizontal: 24,
    position: "absolute",
    top: 50,
    left: 0,
  },
  greetingLine: {
    fontSize: 34,
    lineHeight: 42,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  nameRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  name: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "400",
    letterSpacing: -0.3,
  },
  emoji: {
    fontSize: 20,
    lineHeight: 28,
  },
  dayMascot: {
    position: "absolute",
    right: 10,
    bottom: -50,
    zIndex: 1,
  },
  nightMascot: {
    position: "absolute",
    right: 10,
    bottom: -20,
    zIndex: 1,
  },
});

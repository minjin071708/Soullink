import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const BAR_WIDTH = 3;
const BAR_GAP = 3;

/** Symmetric waveform envelope: low at the edges, peak near the center. */
const BAR_MULTIPLIERS = [
  0.22, 0.28, 0.36, 0.42, 0.55, 0.48, 0.68, 0.58, 0.82, 0.7, 0.94, 0.78, 1,
  0.86, 0.96, 0.74, 0.74, 0.96, 0.86, 1, 0.78, 0.94, 0.7, 0.82, 0.58, 0.68,
  0.48, 0.55, 0.42, 0.36, 0.28, 0.22,
] as const;

const METER_WIDTH =
  BAR_MULTIPLIERS.length * BAR_WIDTH + (BAR_MULTIPLIERS.length - 1) * BAR_GAP;

type AudioLevelMeterProps = {
  level: number;
  active: boolean;
  color?: string;
};

function AudioBar({
  multiplier,
  level,
  active,
  color,
}: {
  multiplier: number;
  level: number;
  active: boolean;
  color: string;
}) {
  const animatedLevel = useSharedValue(0);

  useEffect(() => {
    const target = active ? 0.24 + level * multiplier * 0.76 : 0.16;
    animatedLevel.value = withTiming(target, { duration: 120 });
  }, [active, animatedLevel, level, multiplier]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scaleY: animatedLevel.value }],
    opacity: active ? 0.72 + level * 0.28 : 0.38,
  }));

  return (
    <View style={styles.barSlot}>
      <Animated.View style={[styles.bar, { backgroundColor: color }, style]} />
    </View>
  );
}

/** Bottom-anchored bars driven by the same normalized audio level. */
export function AudioLevelMeter({
  level,
  active,
  color = "#8A6BE8",
}: AudioLevelMeterProps) {
  return (
    <View style={styles.container}>
      {BAR_MULTIPLIERS.map((multiplier, index) => (
        <AudioBar
          key={index}
          multiplier={multiplier}
          level={level}
          active={active}
          color={color}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: METER_WIDTH,
    height: 36,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    alignSelf: "center",
    gap: BAR_GAP,
  },
  barSlot: {
    height: "100%",
    width: BAR_WIDTH,
    justifyContent: "flex-end",
  },
  bar: {
    width: BAR_WIDTH,
    height: "100%",
    borderRadius: 999,
    transformOrigin: "bottom",
  },
});

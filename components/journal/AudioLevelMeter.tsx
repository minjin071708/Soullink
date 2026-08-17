import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const BAR_MULTIPLIERS = [0.54, 0.76, 1, 0.68, 0.88, 0.6] as const;

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

/** Six bottom-anchored bars driven by the same normalized audio level. */
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
    height: 32,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  barSlot: {
    height: "100%",
    width: 4,
    justifyContent: "flex-end",
  },
  bar: {
    width: 4,
    height: "100%",
    borderRadius: 999,
    transformOrigin: "bottom",
  },
});

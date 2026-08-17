import { Image } from "expo-image";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const ORB_IMAGE = require("@/assets/images/voiceAnimation/voiceAnimated.png");

type VoiceOrbProps = {
  level: number;
  isRecording: boolean;
};

/**
 * Animated visual for voice recording. `level` is normalized to 0–1.
 */
export function VoiceOrb({ level, isRecording }: VoiceOrbProps) {
  const pulse = useSharedValue(1);
  const audioLevel = useSharedValue(0);

  useEffect(() => {
    audioLevel.value = withTiming(level, { duration: 110 });
  }, [audioLevel, level]);

  useEffect(() => {
    pulse.value = isRecording
      ? withTiming(1, { duration: 180 })
      : withRepeat(
          withTiming(1.035, {
            duration: 2200,
            easing: Easing.inOut(Easing.sin),
          }),
          -1,
          true
        );
  }, [isRecording, pulse]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: pulse.value * (1 + audioLevel.value * 0.13),
      },
    ],
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: isRecording ? 0.14 + audioLevel.value * 0.38 : 0.1,
    transform: [{ scale: 1.02 + audioLevel.value * 0.22 }],
  }));

  const outerGlowStyle = useAnimatedStyle(() => ({
    opacity: isRecording ? 0.08 + audioLevel.value * 0.2 : 0.06,
    transform: [{ scale: 1.12 + audioLevel.value * 0.38 }],
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.outerGlow, outerGlowStyle]} />
      <Animated.View style={[styles.innerGlow, innerGlowStyle]} />
      <Animated.View style={[styles.orbWrap, orbStyle]}>
        <Image source={ORB_IMAGE} contentFit="contain" style={styles.orb} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  outerGlow: {
    position: "absolute",
    width: 278,
    height: 278,
    borderRadius: 139,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    backgroundColor: "rgba(215, 205, 255, 0.22)",
  },
  innerGlow: {
    position: "absolute",
    width: 224,
    height: 224,
    borderRadius: 112,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.94)",
    backgroundColor: "rgba(198, 224, 255, 0.28)",
  },
  orbWrap: {
    width: 210,
    height: 210,
  },
  orb: {
    width: "100%",
    height: "100%",
  },
});

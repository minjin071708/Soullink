import {
  clearLocalSession,
  unlockWithBiometric,
} from "@/services/authSession";
import { useAuthStore } from "@/store/authStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const APPLE_INK = "#1d1d1f";
const MUTED = "#6E6E73";
const SCREEN_GRADIENT = ["#f3edff", "#fff6f5"] as const;
const LOGIN_HREF = "/(auth)/login" as Href;
const TABS_HREF = "/(tabs)" as Href;

export default function BiometricLockScreen() {
  const status = useAuthStore((s) => s.status);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(TABS_HREF);
    }
    if (status === "unauthenticated") {
      router.replace(LOGIN_HREF);
    }
  }, [status]);

  const handleTryAgain = async () => {
    setBusy(true);
    try {
      const result = await unlockWithBiometric();
      if (result === "authenticated") {
        router.replace(TABS_HREF);
      } else if (result === "unauthenticated") {
        router.replace(LOGIN_HREF);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleUsePassword = async () => {
    setBusy(true);
    try {
      await clearLocalSession();
      router.replace(LOGIN_HREF);
    } finally {
      setBusy(false);
    }
  };

  return (
    <LinearGradient
      colors={[...SCREEN_GRADIENT]}
      locations={[0, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <Ionicons name="finger-print" size={56} color={APPLE_INK} />
          </View>

          <Text style={styles.title}>Unlock SoulLink</Text>
          <Text style={styles.subtitle}>
            Confirm it&apos;s you with fingerprint or Face ID
          </Text>

          {busy ? (
            <ActivityIndicator color={APPLE_INK} style={styles.loader} />
          ) : null}

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() => void handleTryAgain()}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}
            >
              <Text style={styles.primaryLabel}>Try again</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() => void handleUsePassword()}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}
            >
              <Text style={styles.secondaryLabel}>Use password</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: "transparent" },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
  },
  title: {
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: APPLE_INK,
  },
  subtitle: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    color: MUTED,
  },
  loader: { marginTop: 24 },
  actions: { marginTop: 40, gap: 12 },
  primaryButton: {
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: APPLE_INK,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  secondaryButton: {
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryLabel: {
    color: APPLE_INK,
    fontSize: 17,
    fontWeight: "600",
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.55 },
});

import { useAuthBootstrap } from "@/hooks/auth/useAuthBootstrap";
import { useAppStore } from "@/store/use-language-store";
import { Image } from "expo-image";
import { Redirect } from "expo-router";
import { StyleSheet, View } from "react-native";

const BOOT_IMAGE = require("@/assets/images/loginBackground.png");

export default function IndexScreen() {
  const { status, hasCompletedBootstrap } = useAuthBootstrap();
  const language = useAppStore((s) => s.language);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  // Cold start + biometric bootstrap wait
  if (!hasHydrated || !hasCompletedBootstrap || status === "bootstrapping") {
    return (
      <View style={styles.boot}>
        <Image
          source={BOOT_IMAGE}
          style={styles.bootImage}
          contentFit="cover"
          accessibilityLabel="SoulLink"
        />
      </View>
    );
  }

  if (status === "locked") {
    return <Redirect href="/(auth)/biometric-lock" />;
  }

  if (!language) {
    return <Redirect href="/(onboarding)/language" />;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)/introduction" />;
  }

  if (status === "authenticated") {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3edff",
  },
  bootImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

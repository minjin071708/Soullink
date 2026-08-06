import { useAuthBootstrap } from "@/hooks/auth/useAuthBootstrap";
import { useAppStore } from "@/store/use-language-store";
import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function IndexScreen() {
  const { status, hasCompletedBootstrap } = useAuthBootstrap();
  const language = useAppStore((s) => s.language);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  if (!hasHydrated || !hasCompletedBootstrap || status === "bootstrapping") {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#8A6BE8" />
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
});

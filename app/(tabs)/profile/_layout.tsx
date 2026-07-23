import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text } from "react-native";

export default function ProfileStackLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="edit"
        options={{
          headerShown: true,
          headerTitleAlign: "center",
          headerTitle: () => (
            <Text style={styles.title}>{t("profile.editProfile")}</Text>
          ),
          headerLeft: () => (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/profile");
                }
              }}
            >
              <MaterialIcons name="arrow-back-ios" size={24} color="black" />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
  },
});

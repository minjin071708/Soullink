import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function JournalLayout() {
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen
        name="mood"
        options={{
          title: t("journal.mood.title"),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="write"
        options={{
          title: t("journal.write.title"),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          title: t("journal.result.title"),
          headerShown: true,
        }}
      />
    </Stack>
  );
}

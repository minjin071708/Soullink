import { Button, ButtonText } from "@/components/ui/button";
import { useJournalResult } from "@/hooks/useJournalResult";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCREEN_BG = "#f7f8fc";
const TEXT = "#2A2A6A";
const MUTED = "#6E6E8A";
const PRIMARY = "#8A6BE8";

function parseDiaryIdParam(
  value: string | string[] | undefined
): number | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return undefined;
  }

  const diaryId = Number(raw);
  return Number.isInteger(diaryId) && diaryId > 0 ? diaryId : undefined;
}

export default function JournalResultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    diaryId?: string | string[];
  }>();

  const diaryId = parseDiaryIdParam(params.diaryId);
  const { data, isLoading, isError, error } = useJournalResult(diaryId);

  const backgroundColor = SCREEN_BG;
  const textColor = TEXT;
  const mutedColor = MUTED;

  if (diaryId === undefined) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor }]}
        edges={["bottom"]}
      >
        <View style={[styles.container, { backgroundColor }]}>
          <Text style={[styles.title, { color: textColor }]}>
            {t("journal.result.missingIdTitle")}
          </Text>
          <Text style={[styles.body, { color: mutedColor }]}>
            {t("journal.result.missingIdBody")}
          </Text>
          <Button variant="default" onPress={() => router.replace("/(tabs)")}>
            <ButtonText>{t("journal.result.goHome")}</ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor }]}
        edges={["bottom"]}
      >
        <View style={[styles.centered, { backgroundColor }]}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={[styles.loadingText, { color: mutedColor }]}>
            {t("journal.result.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    const message =
      error instanceof Error ? error.message : t("journal.result.errorBody");

    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor }]}
        edges={["bottom"]}
      >
        <View style={[styles.container, { backgroundColor }]}>
          <Text style={[styles.title, { color: textColor }]}>
            {t("journal.result.errorTitle")}
          </Text>
          <Text style={[styles.body, { color: mutedColor }]}>{message}</Text>
          <Button variant="default" onPress={() => router.replace("/(tabs)")}>
            <ButtonText>{t("journal.result.goHome")}</ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      edges={["bottom"]}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.title, { color: textColor }]}>
          {t("journal.result.successTitle")}
        </Text>
        <Text style={[styles.body, { color: mutedColor }]}>
          {t("journal.result.successBody", {
            diaryId: data?.diaryId ?? diaryId,
          })}
        </Text>

        {data?.emotionName ? (
          <Text style={[styles.meta, { color: textColor }]}>
            {data.emotionName}
            {data.emotionDate ? ` · ${data.emotionDate}` : ""}
          </Text>
        ) : null}

        {data?.content ? (
          <Text style={[styles.content, { color: mutedColor }]} numberOfLines={4}>
            {data.content}
          </Text>
        ) : null}

        {data?.analysisStatus ? (
          <Text style={[styles.meta, { color: mutedColor }]}>
            Analysis: {data.analysisStatus}
          </Text>
        ) : null}

        <Button
          variant="default"
          className="mt-6"
          onPress={() => router.replace("/(tabs)")}
        >
          <ButtonText>{t("journal.result.goHome")}</ButtonText>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  meta: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 15,
  },
});

import { DailyAiAnalysisScreen } from "@/features/calendar/components/DailyAiAnalysisScreen";
import { isValidDateString } from "@/features/calendar/utils/calendar.utils";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

function parseDateParam(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !isValidDateString(raw)) {
    return undefined;
  }
  return raw;
}

export default function DailyAnalysisRoute() {
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  const date = parseDateParam(params.date);

  if (!date) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Огноо олдсонгүй</Text>
        <Text style={styles.body}>Зөв YYYY-MM-DD огноо дамжуулна уу.</Text>
      </View>
    );
  }

  return <DailyAiAnalysisScreen date={date} />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F5F3FF",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2A2A6A",
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: "#8D93B8",
    textAlign: "center",
  },
});

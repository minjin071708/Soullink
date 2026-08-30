import { CALENDAR_COLORS } from "@/features/calendar/constants/calendar.constants";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

export function CalendarEmptyState() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("calendar.empty.title")}</Text>
      <Text style={styles.body}>{t("calendar.empty.body")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    backgroundColor: CALENDAR_COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: CALENDAR_COLORS.title,
    marginBottom: 6,
  },
  body: {
    fontSize: 13,
    lineHeight: 19,
    color: CALENDAR_COLORS.muted,
  },
});

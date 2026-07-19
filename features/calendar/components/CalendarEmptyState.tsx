import { CALENDAR_COLORS } from "@/features/calendar/constants/calendar.constants";
import { StyleSheet, Text, View } from "react-native";

export function CalendarEmptyState() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Энэ өдөр тэмдэглэл байхгүй байна</Text>
      <Text style={styles.body}>
        Өөр өдөр сонгоод өөрийн сэтгэл хөдлөлийн тэмдэглэлүүдийг харна уу.
      </Text>
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

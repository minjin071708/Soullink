import { CALENDAR_MASCOT } from "@/features/calendar/constants/calendar.constants";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

export function CalendarMascot() {
  return (
    <View style={styles.wrap} pointerEvents="none">
      <Image
        source={CALENDAR_MASCOT}
        style={styles.image}
        contentFit="contain"
        accessibilityLabel="Календарийн маскот"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "flex-end",
    paddingRight: 8,
    marginTop: 8,
    marginBottom: 8,
    position: "relative"
  },
  image: {
    width: 150,
    height: 150,
    opacity: 0.95,
    position: "absolute",
    top: -30,
    right: 0,
  },
});

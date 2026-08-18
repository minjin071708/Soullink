import { StyleSheet, Text, View } from "react-native";

type DailyInsightCardProps = {
  baseDate: string;
};

export function DailyInsightCard({ baseDate }: DailyInsightCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Daily Insight</Text>
      <Text style={styles.message}>API holbolt hiigdej baina.</Text>
      <Text style={styles.subtle}>{baseDate}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 220,
    borderRadius: 28,
    backgroundColor: "#FFFCFD",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#302060",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    fontWeight: "600",
    color: "#706784",
    textAlign: "center",
  },
  subtle: {
    fontSize: 12,
    color: "#706784",
    textAlign: "center",
  },
});

import { INSIGHT_COLORS } from "@/features/insights/constants/insights.constants";
import type {
  InsightObservation,
  PreviousReport,
} from "@/features/insights/types/insights.types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

type AiObservationSectionProps = {
  observation: string;
  items: InsightObservation[];
};

export function AiObservationSection({
  observation,
  items,
}: AiObservationSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{t("insights.aiObservation")}</Text>
        <Ionicons name="sparkles" size={16} color={INSIGHT_COLORS.sad} />
      </View>
      <Text style={styles.body}>{observation}</Text>

      {items.length > 0 ? (
        <View style={styles.list}>
          {items.map((item, index) => (
            <View key={item.id}>
              {index > 0 ? <View style={styles.divider} /> : null}
              <View style={styles.row}>
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: `${item.accent}22` },
                  ]}
                >
                  <Ionicons
                    name={
                      item.icon === "recurring"
                        ? "git-network-outline"
                        : "moon-outline"
                    }
                    size={18}
                    color={item.accent}
                  />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={[styles.itemSubtitle, { color: item.accent }]}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

type PreviousReportsSectionProps = {
  reports: PreviousReport[];
  onPressReport?: (report: PreviousReport) => void;
};

export function PreviousReportsSection({
  reports,
  onPressReport,
}: PreviousReportsSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t("insights.previousReports")}</Text>
      <View style={styles.reportList}>
        {reports.map((report) => (
          <Pressable
            key={report.id}
            accessibilityRole="button"
            onPress={() => onPressReport?.(report)}
            style={({ pressed }) => [
              styles.reportRow,
              pressed && styles.reportPressed,
            ]}
          >
            <View style={styles.reportIcon}>
              <Ionicons
                name={report.icon === "cloud" ? "cloud-outline" : "partly-sunny-outline"}
                size={18}
                color={INSIGHT_COLORS.sad}
              />
            </View>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <View style={styles.reportDot} />
            <Text style={[styles.reportMood, { color: report.moodColor }]}>
              {report.moodLabel}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={INSIGHT_COLORS.muted}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 22,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: INSIGHT_COLORS.title,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    color: INSIGHT_COLORS.muted,
    marginBottom: 14,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: INSIGHT_COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  list: {
    backgroundColor: INSIGHT_COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: INSIGHT_COLORS.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: INSIGHT_COLORS.title,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  reportList: {
    marginTop: 12,
    gap: 10,
  },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: INSIGHT_COLORS.card,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  reportPressed: {
    opacity: 0.9,
  },
  reportIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3EEFF",
    alignItems: "center",
    justifyContent: "center",
  },
  reportTitle: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "600",
    color: INSIGHT_COLORS.title,
  },
  reportDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: INSIGHT_COLORS.muted,
  },
  reportMood: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
});

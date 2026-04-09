import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { fontFamily, fontSize } from "../../constants/typography";
import { spacing, radii } from "../../constants/spacing";
import { useStore } from "../../store/useStore";
import { getEquivalents, treesToCO2 } from "../../utils/co2";
import { EquivalentCard } from "../../components/ui/EquivalentCard";
import { InfoSheet } from "../../components/ui/InfoSheet";
import { CO2Equivalent } from "../../types";

type DateFilter = "month" | "all";

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={barStyles.container}>
      {data.map((d, i) => {
        const height = (d.value / maxVal) * 120;
        return (
          <View key={i} style={barStyles.column}>
            <Text style={barStyles.barValue}>{d.value}</Text>
            <View style={[barStyles.bar, { height: Math.max(height, 4) }]} />
            <Text style={barStyles.barLabel}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 170, paddingTop: 20 },
  column: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: 28, backgroundColor: colors.brightGreen, borderRadius: 6, marginBottom: 6 },
  barValue: { fontFamily: fontFamily.bodySemiBold, fontSize: 10, color: colors.bark, marginBottom: 4 },
  barLabel: { fontFamily: fontFamily.body, fontSize: 10, color: colors.earth },
});

function MiniLineChart({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const maxVal = Math.max(...data, 1);
  const width = 300;
  const height = 60;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - (v / maxVal) * height,
  }));
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const Svg = require("react-native-svg").default;
  const Path = require("react-native-svg").Path;

  return (
    <View style={{ alignItems: "center", paddingVertical: spacing.sm }}>
      <Svg width={width} height={height}>
        <Path
          d={pathD}
          stroke={colors.brightGreen}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export default function ImpactScreen() {
  const { stats, monthlyImpact, milestones } = useStore();
  const [filter, setFilter] = useState<DateFilter>("all");
  const [mathSheet, setMathSheet] = useState<CO2Equivalent | null>(null);
  const animCount = useRef(new Animated.Value(0)).current;
  const [displayCount, setDisplayCount] = useState(0);

  const totalCO2 = filter === "all"
    ? stats.co2Offset
    : treesToCO2(stats.treesThisMonth);

  useEffect(() => {
    animCount.setValue(0);
    const listener = animCount.addListener(({ value }) => {
      setDisplayCount(Math.round(value));
    });
    Animated.timing(animCount, {
      toValue: totalCO2,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => animCount.removeListener(listener);
  }, [totalCO2]);

  const equivalents = getEquivalents(
    filter === "all" ? stats.treesPlanted : stats.treesThisMonth
  );

  const barData = monthlyImpact.map((m) => ({
    label: m.shortMonth,
    value: m.trees,
  }));

  const cumulativeCO2 = monthlyImpact.reduce<number[]>((acc, m) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
    acc.push(prev + m.co2);
    return acc;
  }, []);

  // Task 8: Fix incomplete month comparison
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastEntry = monthlyImpact[monthlyImpact.length - 1];
  const isCurrentMonthPartial = lastEntry?.month === currentMonthStr;

  const completedMonths = isCurrentMonthPartial
    ? monthlyImpact.slice(0, -1)
    : monthlyImpact;
  const prevCompletedMonth = completedMonths.length >= 2
    ? completedMonths[completedMonths.length - 2].co2
    : 0;
  const lastCompletedMonth = completedMonths.length >= 1
    ? completedMonths[completedMonths.length - 1].co2
    : 0;
  const momChange = prevCompletedMonth > 0
    ? Math.round(((lastCompletedMonth - prevCompletedMonth) / prevCompletedMonth) * 100)
    : 0;

  const renderHeroTrend = () => {
    if (filter === "month") {
      return (
        <Text style={[styles.heroTrend, { color: colors.sage }]}>
          {stats.treesThisMonth} trees so far this month
        </Text>
      );
    }
    if (momChange !== 0) {
      return (
        <Text
          style={[
            styles.heroTrend,
            { color: momChange > 0 ? colors.brightGreen : colors.coral },
          ]}
        >
          {momChange > 0 ? "↑" : "↓"} {Math.abs(momChange)}% vs last completed month
        </Text>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Your Impact</Text>
          <View style={styles.filterRow}>
            {(["month", "all"] as DateFilter[]).map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, filter === f && styles.filterChipActive]}
                onPress={() => setFilter(f)}
              >
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                  {f === "month" ? "This Month" : "All Time"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hero stat */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>
            {filter === "month" ? "CO₂ Offset This Month" : "Total CO₂ Offset"}
          </Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroNumber}>{displayCount.toLocaleString()}</Text>
            <Text style={styles.heroUnit}> kg</Text>
          </View>
          {renderHeroTrend()}
        </View>

        {/* Equivalents */}
        <EquivalentCard
          equivalents={equivalents}
          onTapEquivalent={(eq) => setMathSheet(eq)}
        />

        {/* Monthly bar chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trees Planted Per Month</Text>
          <View style={styles.chartCard}>
            <BarChart data={barData} />
          </View>
        </View>

        {/* Cumulative line */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cumulative CO₂ Offset</Text>
          <View style={styles.chartCard}>
            <MiniLineChart data={cumulativeCO2} />
            <View style={styles.lineLabels}>
              <Text style={styles.lineLabelText}>{monthlyImpact[0]?.shortMonth}</Text>
              <Text style={styles.lineLabelText}>{monthlyImpact[monthlyImpact.length - 1]?.shortMonth}</Text>
            </View>
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.milestonesRow}
          >
            {milestones.map((m) => (
              <View
                key={m.id}
                style={[styles.milestoneCard, !m.earned && styles.milestoneCardLocked]}
              >
                <Text style={styles.milestoneIcon}>{m.icon}</Text>
                <Text style={[styles.milestoneTitle, !m.earned && styles.milestoneLocked]}>
                  {m.title}
                </Text>
                <Text style={styles.milestoneDesc} numberOfLines={2}>
                  {m.earned ? m.earnedDate : m.description}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {mathSheet && (
        <InfoSheet
          visible
          onClose={() => setMathSheet(null)}
          title={`How we calculate: ${mathSheet.value}`}
          body={`Your ${stats.treesPlanted} trees absorb approximately ${stats.co2Offset.toLocaleString()} kg of CO₂ (22 kg per tree per year, EPA estimate).`}
          detail={mathSheet.math ?? `That's equivalent to ${mathSheet.value} ${mathSheet.description}.`}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  headerRow: { marginBottom: spacing.lg },
  title: { fontFamily: fontFamily.display, fontSize: fontSize["3xl"], color: colors.bark, marginBottom: spacing.sm },
  filterRow: { flexDirection: "row", gap: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2, borderRadius: radii.full, backgroundColor: colors.cream },
  filterChipActive: { backgroundColor: colors.brightGreen },
  filterText: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm, color: colors.earth },
  filterTextActive: { color: colors.white },
  heroCard: { backgroundColor: colors.forest, borderRadius: radii.xl, padding: spacing.xl, alignItems: "center", marginBottom: spacing.xl },
  heroLabel: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm, color: colors.sage, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: spacing.xs },
  heroRow: { flexDirection: "row", alignItems: "baseline" },
  heroNumber: { fontFamily: fontFamily.display, fontSize: fontSize["5xl"], color: colors.white },
  heroUnit: { fontFamily: fontFamily.body, fontSize: fontSize.xl, color: colors.sage },
  heroTrend: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm, marginTop: spacing.xs },
  section: { marginTop: spacing.xl },
  sectionTitle: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.md, color: colors.bark, marginBottom: spacing.sm },
  chartCard: { backgroundColor: colors.cream, borderRadius: radii.lg, padding: spacing.md },
  lineLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.xs },
  lineLabelText: { fontFamily: fontFamily.body, fontSize: 10, color: colors.earth },
  milestonesRow: { gap: spacing.sm, paddingRight: spacing.lg },
  milestoneCard: {
    width: 110, backgroundColor: colors.cream, borderRadius: radii.lg, padding: spacing.md,
    alignItems: "center", borderWidth: 1, borderColor: colors.paleGreen,
  },
  milestoneCardLocked: { opacity: 0.45 },
  milestoneIcon: { fontSize: 28, marginBottom: 6 },
  milestoneTitle: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.xs, color: colors.bark, textAlign: "center", marginBottom: 2 },
  milestoneLocked: { color: colors.sage },
  milestoneDesc: { fontFamily: fontFamily.body, fontSize: 10, color: colors.earth, textAlign: "center" },
});

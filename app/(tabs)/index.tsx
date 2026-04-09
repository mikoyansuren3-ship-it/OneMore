import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { fontFamily, fontSize } from "../../constants/typography";
import { spacing, radii } from "../../constants/spacing";
import { getTier } from "../../constants/tiers";
import { getEquivalents } from "../../utils/co2";
import { useStore } from "../../store/useStore";
import { ProgressRing } from "../../components/ui/ProgressRing";
import { TreeDollarProgressBar } from "../../components/ui/TreeDollarProgressBar";
import { StatCard } from "../../components/ui/StatCard";
import { EquivalentCard } from "../../components/ui/EquivalentCard";
import { TransactionItem } from "../../components/ui/TransactionItem";
import { TierBadge } from "../../components/ui/TierBadge";
import { FloatingButton } from "../../components/ui/FloatingButton";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { InfoSheet } from "../../components/ui/InfoSheet";
import {
  TreeIcon,
  WaveIcon,
  CloudIcon,
} from "../../components/icons/TabIcons";

export default function HomeScreen() {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [doubleImpactInfo, setDoubleImpactInfo] = useState(false);
  const {
    profile,
    stats,
    weeklySummary,
    transactions,
    roundUpSettings,
    setMultiplier,
    setThreshold,
    togglePause,
  } = useStore();

  const tier = getTier(stats.treesPlanted);
  const equivalents = getEquivalents(stats.treesPlanted);
  const ringProgress =
    stats.treeCostCents > 0
      ? Math.min(stats.nextTreeProgress / stats.treeCostCents, 1)
      : 0;
  const costPerTree = stats.totalDonated > 0
    ? (stats.totalDonated / stats.treesPlanted).toFixed(2)
    : "1.18";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            Hey, {profile.firstName} {"👋"}
          </Text>
          <TierBadge tier={tier} treesPlanted={stats.treesPlanted} />
        </View>

        <View style={styles.ringSection}>
          <ProgressRing
            progress={ringProgress}
            value={stats.treesThisMonth.toString()}
            label="trees this month"
          />
          <TreeDollarProgressBar
            nextTreeProgressCents={stats.nextTreeProgress}
            treeCostCents={stats.treeCostCents}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon={<TreeIcon size={20} color={colors.leaf} />}
            value={stats.treesPlanted.toString()}
            label="Trees Planted"
          />
          <StatCard
            icon={<WaveIcon size={20} color={colors.lightOcean} />}
            value={stats.plasticRemoved.toString()}
            label="Lbs Plastic"
          />
          <StatCard
            icon={<CloudIcon size={20} color={colors.sage} />}
            value={stats.co2Offset.toLocaleString()}
            label="KG CO₂ Offset"
          />
        </View>

        <EquivalentCard equivalents={equivalents} />

        <View style={styles.weeklyCard}>
          <View style={styles.weeklyLeft}>
            <Text style={styles.weeklyLabel}>This Week</Text>
            <Text style={styles.weeklyStat}>
              ${weeklySummary.donated.toFixed(2)} donated → {weeklySummary.treesPlanted} trees planted
            </Text>
            <Text style={styles.weeklyChange}>
              ↑ {weeklySummary.percentChange}% from last week
            </Text>
            <Text style={styles.conversionRate}>
              1 tree ≈ ${costPerTree} donated
            </Text>
          </View>
          <Text style={styles.streak}>
            {"🔥"} {weeklySummary.streakWeeks}-week streak
          </Text>
        </View>

        <View style={styles.feedSection}>
          <Text style={styles.feedHeader}>Recent Round-Ups</Text>
          {transactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onDoubleImpactInfo={() => setDoubleImpactInfo(true)}
            />
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <FloatingButton onPress={() => setSheetVisible(true)} />

      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        settings={roundUpSettings}
        onMultiplier={setMultiplier}
        onThreshold={setThreshold}
        onTogglePause={togglePause}
      />

      <InfoSheet
        visible={doubleImpactInfo}
        onClose={() => setDoubleImpactInfo(false)}
        title="Double Impact ✦"
        body="When you shop at a OneMore partner business, they match your round-up donation (up to $1.00). Your spare change goes twice as far — double the trees, double the impact."
        detail="Partners commit $0.25 per transaction to environmental restoration. When a OneMore user shops there, the business matches the user's round-up, creating a Double Impact moment."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.warmWhite,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  greeting: {
    marginBottom: spacing.lg,
  },
  greetingText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.lg,
    color: colors.bark,
    marginBottom: 4,
  },
  ringSection: {
    backgroundColor: colors.forest,
    borderRadius: radii.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  weeklyCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.green,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: spacing.xl,
  },
  weeklyLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  weeklyLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.bark,
    marginBottom: 6,
  },
  weeklyStat: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.forest,
    marginBottom: 4,
  },
  weeklyChange: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.brightGreen,
  },
  conversionRate: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.earth,
    marginTop: 4,
  },
  streak: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.amber,
  },
  feedSection: {
    marginTop: spacing.xl,
  },
  feedHeader: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.bark,
    marginBottom: spacing.sm,
  },
});

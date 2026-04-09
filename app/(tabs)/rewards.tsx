import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { fontFamily, fontSize } from "../../constants/typography";
import { spacing, radii } from "../../constants/spacing";
import { useStore } from "../../store/useStore";
import { getTier, tiers } from "../../constants/tiers";

type LeaderboardFilter = "month" | "all";

function AlmostThereBadge({ treesAway }: { treesAway: number }) {
  return (
    <View style={nudgeStyles.badge}>
      <Text style={nudgeStyles.text}>
        Only {treesAway} tree{treesAway === 1 ? "" : "s"} away!
      </Text>
    </View>
  );
}

const nudgeStyles = StyleSheet.create({
  badge: {
    backgroundColor: "rgba(212,136,62,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  text: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 10,
    color: colors.amber,
  },
});

export default function RewardsScreen() {
  const { stats, leaderboard, rewards, weeklySummary } = useStore();
  const [lbFilter, setLbFilter] = useState<LeaderboardFilter>("all");
  const tier = getTier(stats.treesPlanted);
  const nextTier = tiers.find((t) => t.min > stats.treesPlanted);
  const tierProgress = nextTier
    ? (stats.treesPlanted - tier.min) / (nextTier.min - tier.min)
    : 1;

  const streakWeeks = weeklySummary.streakWeeks;
  const recentWeeks = Array.from({ length: 8 }, (_, i) => i < streakWeeks);

  const discountRewards = rewards.filter((r) => r.type === "discount");
  const badgeRewards = rewards.filter((r) => r.type === "badge" || r.type === "streak");

  // Task 7: Determine if a locked perk qualifies for "almost there"
  const isAlmostThere = (unlockAt: number) => {
    if (stats.treesPlanted >= unlockAt) return false;
    const diff = unlockAt - stats.treesPlanted;
    const twentyPercent = Math.ceil(unlockAt * 0.2);
    return diff <= Math.min(twentyPercent, 5);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Rewards & Rankings</Text>

        {/* Tier rank card */}
        <View style={styles.tierCard}>
          <View style={styles.tierHeader}>
            <Text style={styles.tierIcon}>{tier.icon}</Text>
            <View style={styles.tierInfo}>
              <Text style={styles.tierName}>{tier.name}</Text>
              <Text style={styles.tierRank}>
                Rank #{leaderboard.find((l) => l.isCurrentUser)?.rank ?? "--"} · {stats.treesPlanted} trees
              </Text>
            </View>
          </View>
          {nextTier && (
            <View style={styles.progressSection}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(tierProgress * 100, 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {nextTier.min - stats.treesPlanted} trees to {nextTier.icon}{" "}
                {nextTier.name}
              </Text>
            </View>
          )}
        </View>

        {/* Streak */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Text style={styles.streakEmoji}>{"🔥"}</Text>
            <Text style={styles.streakCount}>{streakWeeks}-week streak</Text>
          </View>
          <View style={styles.calendarRow}>
            {recentWeeks.map((active, i) => (
              <View
                key={i}
                style={[
                  styles.calendarDot,
                  active ? styles.calendarActive : styles.calendarInactive,
                ]}
              >
                {active && <Text style={styles.calendarCheck}>✓</Text>}
              </View>
            ))}
          </View>
          <Text style={styles.streakLabel}>Last 8 weeks</Text>
        </View>

        {/* Leaderboard */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <View style={styles.filterRow}>
              {(["month", "all"] as LeaderboardFilter[]).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, lbFilter === f && styles.filterChipActive]}
                  onPress={() => setLbFilter(f)}
                >
                  <Text style={[styles.filterText, lbFilter === f && styles.filterTextActive]}>
                    {f === "month" ? "Month" : "All Time"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {leaderboard.map((entry) => (
            <View
              key={entry.rank}
              style={[styles.lbRow, entry.isCurrentUser && styles.lbRowHighlight]}
            >
              <Text style={[styles.lbRank, entry.rank <= 3 && styles.lbRankTop]}>
                {entry.rank}
              </Text>
              <Text style={styles.lbTierIcon}>{entry.tierIcon}</Text>
              <Text
                style={[styles.lbName, entry.isCurrentUser && styles.lbNameBold]}
                numberOfLines={1}
              >
                {entry.name}
                {entry.isCurrentUser ? " (you)" : ""}
              </Text>
              <Text style={styles.lbTrees}>{entry.trees} {"🌳"}</Text>
            </View>
          ))}
        </View>

        {/* Partner rewards — Task 7: "Almost there" nudge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partner Perks</Text>
          <View style={styles.rewardsGrid}>
            {discountRewards.map((r) => {
              const almostThere = !r.unlocked && isAlmostThere(r.unlockAt);
              const treesAway = r.unlockAt - stats.treesPlanted;
              return (
                <View
                  key={r.id}
                  style={[
                    styles.rewardCard,
                    !r.unlocked && !almostThere && styles.rewardCardLocked,
                    almostThere && styles.rewardCardAlmost,
                  ]}
                >
                  <Text style={styles.rewardIcon}>{r.icon}</Text>
                  <Text style={styles.rewardTitle} numberOfLines={2}>{r.title}</Text>
                  <Text style={styles.rewardDesc} numberOfLines={2}>
                    {r.unlocked
                      ? r.description
                      : `Unlock at ${r.unlockAt} trees`}
                  </Text>
                  {almostThere && <AlmostThereBadge treesAway={treesAway} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* Badges — Task 6: Fixed truncation with numberOfLines={2} and wider cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badges & Streaks</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeRow}
          >
            {badgeRewards.map((r) => (
              <View
                key={r.id}
                style={[styles.badgeCard, !r.unlocked && styles.badgeCardLocked]}
              >
                <Text style={styles.badgeIcon}>{r.icon}</Text>
                <Text style={styles.badgeTitle} numberOfLines={2}>
                  {r.title}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  title: { fontFamily: fontFamily.display, fontSize: fontSize["3xl"], color: colors.bark, marginBottom: spacing.lg },
  tierCard: { backgroundColor: colors.forest, borderRadius: radii.xl, padding: spacing.lg, marginBottom: spacing.lg },
  tierHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  tierIcon: { fontSize: 40, marginRight: spacing.md },
  tierInfo: { flex: 1 },
  tierName: { fontFamily: fontFamily.display, fontSize: fontSize["2xl"], color: colors.white },
  tierRank: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.sage, marginTop: 2 },
  progressSection: { gap: 6 },
  progressBar: { height: 8, backgroundColor: colors.deepGreen, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.brightGreen, borderRadius: 4 },
  progressLabel: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.sage },
  streakCard: {
    backgroundColor: colors.cream, borderRadius: radii.lg, padding: spacing.lg,
    alignItems: "center", marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.paleGreen,
  },
  streakHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md },
  streakEmoji: { fontSize: 28 },
  streakCount: { fontFamily: fontFamily.display, fontSize: fontSize.xl, color: colors.amber },
  calendarRow: { flexDirection: "row", gap: 8, marginBottom: spacing.xs },
  calendarDot: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  calendarActive: { backgroundColor: colors.brightGreen },
  calendarInactive: { backgroundColor: colors.paleGreen },
  calendarCheck: { fontFamily: fontFamily.bodyBold, fontSize: 14, color: colors.white },
  streakLabel: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.earth },
  section: { marginBottom: spacing.lg },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionTitle: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.lg, color: colors.bark, marginBottom: spacing.sm },
  filterRow: { flexDirection: "row", gap: 6 },
  filterChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.full, backgroundColor: colors.cream },
  filterChipActive: { backgroundColor: colors.brightGreen },
  filterText: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.xs, color: colors.earth },
  filterTextActive: { color: colors.white },
  lbRow: {
    flexDirection: "row", alignItems: "center", paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: "rgba(212,232,209,0.3)",
  },
  lbRowHighlight: { backgroundColor: "rgba(61,163,93,0.08)", borderRadius: radii.md, borderBottomWidth: 0 },
  lbRank: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.md, color: colors.earth, width: 28 },
  lbRankTop: { color: colors.gold },
  lbTierIcon: { fontSize: 18, marginRight: spacing.sm },
  lbName: { fontFamily: fontFamily.body, fontSize: fontSize.md, color: colors.bark, flex: 1 },
  lbNameBold: { fontFamily: fontFamily.bodySemiBold, color: colors.brightGreen },
  lbTrees: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm, color: colors.earth },
  rewardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  rewardCard: {
    width: "48%" as any, backgroundColor: colors.cream, borderRadius: radii.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.paleGreen,
  },
  rewardCardLocked: { opacity: 0.5 },
  rewardCardAlmost: { borderColor: colors.amber, borderWidth: 1.5, opacity: 1 },
  rewardIcon: { fontSize: 28, marginBottom: spacing.xs },
  rewardTitle: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm, color: colors.bark, marginBottom: 2 },
  rewardDesc: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.earth },
  badgeRow: { gap: spacing.sm, paddingRight: spacing.lg },
  badgeCard: {
    width: 100, alignItems: "center", backgroundColor: colors.cream,
    borderRadius: radii.lg, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.xs,
    borderWidth: 1, borderColor: colors.paleGreen,
  },
  badgeCardLocked: { opacity: 0.4 },
  badgeIcon: { fontSize: 30, marginBottom: 4 },
  badgeTitle: {
    fontFamily: fontFamily.bodySemiBold, fontSize: 10, color: colors.bark,
    textAlign: "center", lineHeight: 13,
  },
});

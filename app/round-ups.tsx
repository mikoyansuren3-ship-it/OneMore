import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors } from "../constants/colors";
import { fontFamily, fontSize } from "../constants/typography";
import { spacing, radii } from "../constants/spacing";
import { useStore } from "../store/useStore";
import { RoundUpTransaction } from "../types/plaid";
import { groupTransactionsByDay } from "../utils/roundUpSections";
import { formatCurrency } from "../utils/format";
import { ErrorState } from "../components/ui/ErrorState";

/** Toggle to preview the generic error layout (mock data only). */
const SIMULATE_LOAD_ERROR = false;

export default function RoundUpsScreen() {
  const { roundUpTransactions, roundUpSummary, updateRoundUpSummary, isPlaidLinked } =
    useStore();
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);
  const fade = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const sections = useMemo(
    () => groupTransactionsByDay(roundUpTransactions),
    [roundUpTransactions]
  );

  const pending = roundUpSummary.pendingDonation;
  const threshold = roundUpSummary.donationThreshold;
  const progress = Math.min(pending / threshold, 1);

  const handleDonate = async () => {
    if (pending <= 1) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDonating(true);
    // TODO: Replace with real transaction sync from Plaid API
    setTimeout(() => {
      const donated = useStore.getState().roundUpSummary.pendingDonation;
      const prev = useStore.getState().roundUpSummary;
      updateRoundUpSummary({
        pendingDonation: 0,
        totalDonated: prev.totalDonated + donated,
        treesPlanted: prev.treesPlanted + 1,
      });
      setDonating(false);
      setSuccessFlash(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1200),
        Animated.timing(fade, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setSuccessFlash(false));
    }, 2000);
  };

  const renderRow = ({ item }: { item: RoundUpTransaction }) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.merchant} numberOfLines={1}>
          {item.merchantName}
        </Text>
        <View style={styles.catBadge}>
          <Text style={styles.catText}>{item.merchantCategory}</Text>
        </View>
      </View>
      <Text style={styles.orig}>{formatCurrency(item.originalAmount)}</Text>
      <Text style={styles.round}>+{formatCurrency(item.roundUpAmount)}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brightGreen} />
          <Text style={styles.loadingText}>Loading round-ups…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (SIMULATE_LOAD_ERROR) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.errorPad}>
          <ErrorState
            message="We couldn’t load your activity. Try again in a moment."
            actionLabel="Try again"
            onAction={() => {}}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!isPlaidLinked || roundUpTransactions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>🌱</Text>
          <Text style={styles.emptyTitle}>No round-ups yet</Text>
          <Text style={styles.emptyDesc}>
            Link a bank account to see your spare change stack up for the planet.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/connect-bank")}
          >
            <Text style={styles.primaryBtnText}>Connect Bank</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={renderRow}
        ListHeaderComponent={
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.pendingLabel}>Pending Donation</Text>
              <Text style={styles.pendingAmt}>
                {formatCurrency(roundUpSummary.pendingDonation)}
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.progressMeta}>
                {formatCurrency(pending)} of {formatCurrency(threshold)}
              </Text>
              <TouchableOpacity
                style={[styles.donateBtn, pending <= 1 && styles.donateBtnDisabled]}
                onPress={handleDonate}
                disabled={donating || pending <= 1}
              >
                {donating ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.donateText}>Donate Now</Text>
                )}
              </TouchableOpacity>
              <View style={styles.statsRow}>
                <Text style={styles.statMini}>
                  This Week: {formatCurrency(roundUpSummary.thisWeekRoundUps)}
                </Text>
                <Text style={styles.statDivider}>|</Text>
                <Text style={styles.statMini}>
                  Month: {formatCurrency(roundUpSummary.thisMonthRoundUps)}
                </Text>
                <Text style={styles.statDivider}>|</Text>
                <Text style={styles.statMini}>
                  All Time: {formatCurrency(roundUpSummary.totalRoundUps)}
                </Text>
              </View>
            </View>

            <Text style={styles.listTitle}>Activity</Text>
          </>
        }
        ListFooterComponent={
          <View style={styles.impact}>
            <Text style={styles.impactEmoji}>
              🌳{"   "}🌊
            </Text>
            <Text style={styles.impactText}>
              Your round-ups have planted {roundUpSummary.treesPlanted} trees and removed{" "}
              {roundUpSummary.plasticRemoved} lbs of ocean plastic.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
      />

      {successFlash && (
        <Animated.View style={[styles.toast, { opacity: fade }]}>
          <Text style={styles.toastText}>Donation sent — thank you!</Text>
        </Animated.View>
      )}

      {donating && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={colors.brightGreen} />
            <Text style={styles.overlayText}>Processing donation…</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
        <Text style={styles.backBtn}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Round-Ups</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  backBtn: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.brightGreen,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize["3xl"],
    color: colors.bark,
    marginBottom: spacing.md,
  },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  summaryCard: {
    backgroundColor: colors.forest,
    borderRadius: radii.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  pendingLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.sage,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  pendingAmt: {
    fontFamily: fontFamily.display,
    fontSize: fontSize["4xl"],
    color: colors.white,
    marginBottom: spacing.md,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.deepGreen,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  progressFill: { height: "100%", backgroundColor: colors.brightGreen, borderRadius: 4 },
  progressMeta: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.sage,
    marginBottom: spacing.md,
  },
  donateBtn: {
    backgroundColor: colors.brightGreen,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  donateBtnDisabled: { opacity: 0.45 },
  donateText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.white,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.xs,
  },
  statMini: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.sage,
  },
  statDivider: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.deepGreen },
  listTitle: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.bark,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.earth,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.paleGreen,
    gap: spacing.sm,
  },
  rowLeft: { flex: 1, minWidth: 0 },
  merchant: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.bark,
    marginBottom: 4,
  },
  catBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.paleGreen,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  catText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 9,
    color: colors.deepGreen,
    textTransform: "uppercase",
  },
  orig: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.earth,
    width: 56,
    textAlign: "right",
  },
  round: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.sm,
    color: colors.brightGreen,
    width: 56,
    textAlign: "right",
  },
  impact: {
    marginTop: spacing.lg,
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.paleGreen,
  },
  impactEmoji: { fontSize: 22, marginBottom: spacing.sm, textAlign: "center" },
  impactText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.bark,
    textAlign: "center",
    lineHeight: 20,
  },
  errorPad: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing.md },
  loadingText: { fontFamily: fontFamily.body, fontSize: fontSize.sm, color: colors.sage },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xl,
    color: colors.bark,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.earth,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    backgroundColor: colors.brightGreen,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  primaryBtnText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.white,
  },
  toast: {
    position: "absolute",
    bottom: 120,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.forest,
    padding: spacing.md,
    borderRadius: radii.md,
    alignItems: "center",
  },
  toastText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.white,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20,42,26,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayCard: {
    backgroundColor: colors.cream,
    padding: spacing.xl,
    borderRadius: radii.lg,
    alignItems: "center",
    gap: spacing.md,
    minWidth: 200,
  },
  overlayText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.bark,
  },
});

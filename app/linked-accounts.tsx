import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Switch,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { colors } from "../constants/colors";
import { fontFamily, fontSize } from "../constants/typography";
import { spacing, radii } from "../constants/spacing";
import { useStore } from "../store/useStore";
import { LinkedAccount } from "../types/plaid";
import { ErrorState } from "../components/ui/ErrorState";

const SIMULATE_LOAD_ERROR = false;

function typeLabel(t: LinkedAccount["accountType"]) {
  if (t === "checking") return "Checking";
  if (t === "savings") return "Savings";
  return "Credit";
}

function formatLinkedDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function LinkedAccountsScreen() {
  const {
    linkedAccounts,
    toggleAccountActive,
    unlinkAccount,
    isPlaidLinked,
  } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  const confirmUnlink = useCallback(
    (acc: LinkedAccount) => {
      Alert.alert(
        "Unlink account?",
        `Are you sure you want to unlink ${acc.institutionName} ••••${acc.accountMask}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Unlink",
            style: "destructive",
            onPress: async () => {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              unlinkAccount(acc.id);
            },
          },
        ]
      );
    },
    [unlinkAccount]
  );

  const renderItem = ({ item }: { item: LinkedAccount }) => (
    <TouchableOpacity
      style={[styles.card, !item.isActive && styles.cardInactive]}
      activeOpacity={0.85}
      onLongPress={() => confirmUnlink(item)}
      delayLongPress={450}
    >
      <View style={styles.cardTop}>
        <View style={styles.bankIcon}>
          <Text style={styles.bankEmoji}>{item.institutionLogo}</Text>
        </View>
        <View style={styles.cardMain}>
          <Text style={styles.instName}>{item.institutionName}</Text>
          <Text style={styles.acctLine}>
            {item.accountName} · ••••{item.accountMask}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{typeLabel(item.accountType)}</Text>
            </View>
          </View>
          <Text style={styles.linkedOn}>Linked on {formatLinkedDate(item.linkedAt)}</Text>
        </View>
      </View>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Round-ups</Text>
        <Switch
          value={item.isActive}
          onValueChange={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggleAccountActive(item.id);
          }}
          trackColor={{ false: colors.paleGreen, true: colors.brightGreen }}
          thumbColor={colors.white}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Linked Accounts</Text>
      </View>

      {loading ? (
        <View style={styles.skeletonWrap}>
          <ActivityIndicator color={colors.brightGreen} size="large" />
          <Text style={styles.skeletonHint}>Loading accounts…</Text>
          <View style={styles.skelLine} />
          <View style={[styles.skelLine, { width: "70%" }]} />
        </View>
      ) : SIMULATE_LOAD_ERROR ? (
        <View style={styles.pad}>
          <ErrorState
            message="We couldn’t load your linked accounts. Check your connection and try again."
            onAction={() => {}}
          />
        </View>
      ) : !isPlaidLinked || linkedAccounts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🏦</Text>
          <Text style={styles.emptyTitle}>No accounts linked yet</Text>
          <Text style={styles.emptyDesc}>
            Connect your first account to start rounding up purchases for the planet.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/connect-bank")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Connect Bank</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={linkedAccounts}
          keyExtractor={(a) => a.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <Text style={styles.hintGlobal}>Long-press a card to unlink an account</Text>
          }
        />
      )}

      {!loading && isPlaidLinked && linkedAccounts.length > 0 && (
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => router.push("/connect-bank")}
          activeOpacity={0.85}
        >
          <Text style={styles.outlineBtnText}>+ Link Another Account</Text>
        </TouchableOpacity>
      )}

      <View style={styles.footerBox}>
        <Text style={styles.footerTitle}>How it works</Text>
        <Text style={styles.footerText}>
          {/* TODO: Replace with real Plaid API call */}
          OneMore uses Plaid to securely read your transactions. We never store your
          bank login. Disconnect anytime from this screen.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  backBtn: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.brightGreen,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize["3xl"],
    color: colors.bark,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  card: {
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.paleGreen,
  },
  cardInactive: { opacity: 0.55 },
  cardTop: { flexDirection: "row", marginBottom: spacing.md },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.deepGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  bankEmoji: { fontSize: 22 },
  cardMain: { flex: 1 },
  instName: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.bark,
  },
  acctLine: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.earth,
    marginTop: 2,
  },
  badgeRow: { flexDirection: "row", marginTop: spacing.xs },
  typeBadge: {
    backgroundColor: colors.paleGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  typeBadgeText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.deepGreen,
  },
  linkedOn: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.sage,
    marginTop: spacing.xs,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(212,232,209,0.6)",
    paddingTop: spacing.sm,
  },
  toggleLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.bark,
  },
  hintGlobal: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.sage,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  empty: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: spacing.xxl,
  },
  emptyIcon: { fontSize: 52, marginBottom: spacing.md },
  emptyTitle: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xl,
    color: colors.bark,
    marginBottom: spacing.sm,
    textAlign: "center",
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
  outlineBtn: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.brightGreen,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  outlineBtnText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.brightGreen,
  },
  footerBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.paleGreen,
  },
  footerTitle: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.bark,
    marginBottom: spacing.xs,
  },
  footerText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.earth,
    lineHeight: 20,
  },
  skeletonWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  skeletonHint: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.sage,
    marginTop: spacing.md,
  },
  skelLine: {
    height: 12,
    backgroundColor: colors.paleGreen,
    borderRadius: 6,
    width: "85%",
    marginTop: spacing.lg,
  },
  pad: { paddingHorizontal: spacing.lg },
});

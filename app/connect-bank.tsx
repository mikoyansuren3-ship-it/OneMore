import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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
import { mockLinkedAccounts, mockTransactions, mockRoundUpSummary } from "../utils/mockPlaidData";
import { PlaidLinkButton } from "../components/PlaidLinkButton";
import { isLivePlaidAvailable, type ExchangeAccountPayload } from "../services/plaid";
import { useAuth } from "../contexts/AuthContext";
import { exchangePayloadToLinkedAccount } from "../utils/plaidAccountMap";

export default function ConnectBankScreen() {
  const { linkAccount, setRoundUpTransactions, updateRoundUpSummary } = useStore();
  const { session } = useAuth();
  const hasSession = Boolean(session?.access_token);
  const [mockLoading, setMockLoading] = useState(false);
  const [mockSuccess, setMockSuccess] = useState(false);
  const scale = useRef(new Animated.Value(0)).current;

  const livePlaid = isLivePlaidAvailable();

  useEffect(() => {
    if (mockSuccess) {
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [mockSuccess, scale]);

  const applyLinkedAccountAndNavigate = () => {
    const existing = useStore.getState().linkedAccounts.map((a) => a.id);
    const next =
      mockLinkedAccounts.find((a) => !existing.includes(a.id)) ?? mockLinkedAccounts[0];
    linkAccount({ ...next });
    if (useStore.getState().roundUpTransactions.length === 0) {
      setRoundUpTransactions([...mockTransactions]);
    }
    updateRoundUpSummary({ ...mockRoundUpSummary });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      router.replace("/linked-accounts");
    }, 900);
  };

  const handleMockConnect = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMockLoading(true);
    setTimeout(() => {
      setMockLoading(false);
      setMockSuccess(true);
      applyLinkedAccountAndNavigate();
    }, 2000);
  };

  const handleLiveSuccess = async (account: ExchangeAccountPayload) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    linkAccount(exchangePayloadToLinkedAccount(account));
    if (useStore.getState().roundUpTransactions.length === 0) {
      setRoundUpTransactions([...mockTransactions]);
    }
    updateRoundUpSummary({ ...mockRoundUpSummary });
    router.replace("/linked-accounts");
  };

  const useLiveLink = livePlaid && hasSession;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={styles.backRow}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Connect Bank Account</Text>

        <View style={styles.illustration}>
          <Text style={styles.illEmoji}>🔒</Text>
          <Text style={styles.illTitle}>Secure Connection</Text>
          <Text style={styles.illSub}>
            Your credentials are encrypted and never stored on our servers.
          </Text>
        </View>

        <View style={styles.bullets}>
          {[
            "OneMore uses bank-level encryption to securely connect your account",
            "We can only view transactions — we can never move your money",
            "You can disconnect at any time",
          ].map((line) => (
            <View key={line} style={styles.bulletRow}>
              <Text style={styles.check}>✓</Text>
              <Text style={styles.bulletText}>{line}</Text>
            </View>
          ))}
        </View>

        {livePlaid && !hasSession && (
          <Text style={styles.envHint}>
            Configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, deploy Edge
            Functions, and sign in with Supabase Auth to use live Plaid sandbox. Until then, use
            demo mode below.
          </Text>
        )}

        {useLiveLink ? (
          <PlaidLinkButton onSuccess={handleLiveSuccess} label="Connect with Plaid" />
        ) : (
          <TouchableOpacity
            style={[styles.cta, mockLoading && styles.ctaDisabled]}
            onPress={handleMockConnect}
            disabled={mockLoading || mockSuccess}
            activeOpacity={0.85}
          >
            {mockLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : mockSuccess ? (
              <Animated.View style={{ transform: [{ scale }] }}>
                <Text style={styles.ctaText}>✓ Linked</Text>
              </Animated.View>
            ) : (
              <Text style={styles.ctaText}>
                {livePlaid ? "Try demo (no auth)" : "Connect with Plaid"}
              </Text>
            )}
          </TouchableOpacity>
        )}

        <Text style={styles.footer}>Powered by Plaid</Text>
      </ScrollView>

      {mockLoading && !useLiveLink && (
        <View style={styles.overlay} pointerEvents="auto">
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={colors.brightGreen} />
            <Text style={styles.overlayText}>Connecting securely…</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.warmWhite },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  backRow: { marginBottom: spacing.sm },
  backText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.brightGreen,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize["3xl"],
    color: colors.bark,
    marginBottom: spacing.lg,
  },
  illustration: {
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.paleGreen,
  },
  illEmoji: { fontSize: 48, marginBottom: spacing.sm },
  illTitle: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.bark,
    marginBottom: spacing.xs,
  },
  illSub: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.earth,
    textAlign: "center",
    lineHeight: 20,
  },
  bullets: { marginBottom: spacing.xl, gap: spacing.md },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  check: {
    fontFamily: fontFamily.bodyBold,
    fontSize: fontSize.md,
    color: colors.brightGreen,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.bark,
    lineHeight: 22,
  },
  envHint: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.earth,
    lineHeight: 18,
    marginBottom: spacing.md,
    backgroundColor: colors.cream,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.paleGreen,
  },
  cta: {
    backgroundColor: colors.brightGreen,
    borderRadius: radii.lg,
    paddingVertical: spacing.md + 2,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  ctaDisabled: { opacity: 0.85 },
  ctaText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.white,
  },
  footer: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.sage,
    textAlign: "center",
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

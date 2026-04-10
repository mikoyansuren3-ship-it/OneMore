import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MAIN_TABS_HREF } from "../constants/routes";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { PlaidLinkButton } from "../components/PlaidLinkButton";
import { useAuth } from "../contexts/AuthContext";
import { saveOnboardingComplete } from "../services/profile";
import { useStore } from "../store/useStore";
import { mockTransactions, mockRoundUpSummary } from "../utils/mockPlaidData";
import { exchangePayloadToLinkedAccount } from "../utils/plaidAccountMap";
import type { ExchangeAccountPayload } from "../services/plaid";
import {
  CAUSE_IDS,
  CAUSE_LABELS,
  TREE_GOAL_OPTIONS,
  type CauseId,
} from "../types/profile";
import { fontFamily, fontSize } from "../constants/typography";
import { spacing, radii } from "../constants/spacing";

const { width: SCREEN_W } = Dimensions.get("window");

const BG = "#1B3A2D";
const PRIMARY = "#2E7D32";
const ACCENT = "#4CAF50";
const CREAM = "#F5F0E8";
const PANEL_TEXT = "#1B3A2D";
const SUBTEXT_ON_DARK = "rgba(245,240,232,0.75)";

const STEPS = 5;

export default function OnboardingScreen() {
  const router = useRouter();
  const { user, refreshDbProfile } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [causes, setCauses] = useState<CauseId[]>([]);
  const [monthlyGoal, setMonthlyGoal] = useState<number>(10);
  const [saving, setSaving] = useState(false);
  const [bankLinkedPulse, setBankLinkedPulse] = useState(false);
  const [showDoneOverlay, setShowDoneOverlay] = useState(false);
  const checkScale = useRef(new Animated.Value(0)).current;
  const nameInputRef = useRef<TextInput>(null);

  const { linkAccount, setRoundUpTransactions, updateRoundUpSummary, setPlaidLinked } =
    useStore();

  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => nameInputRef.current?.focus(), 400);
      return () => clearTimeout(t);
    }
  }, [step]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ x: step * SCREEN_W, animated: true });
  }, [step]);

  const toggleCause = (id: CauseId) => {
    void Haptics.selectionAsync();
    setCauses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const onScrollEnd = useCallback((x: number) => {
    const i = Math.round(x / SCREEN_W);
    if (i >= 0 && i < STEPS) setStep(i);
  }, []);

  const goNext = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => Math.min(s + 1, STEPS - 1));
  };

  const goBack = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => Math.max(s - 1, 0));
  };

  const skipMonthlyGoal = () => {
    void Haptics.selectionAsync();
    setMonthlyGoal(10);
    setStep(3);
  };

  const buildPayload = useCallback(() => {
    return {
      first_name: firstName.trim(),
      last_name: lastName.trim() || null,
      causes: [...causes],
      monthly_tree_goal: monthlyGoal,
      onboarding_completed: true,
    };
  }, [firstName, lastName, causes, monthlyGoal]);

  const completeAndExit = useCallback(async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      const { error } = await saveOnboardingComplete(user.id, buildPayload());
      if (error) {
        Alert.alert("Could not save your profile", error.message);
        return;
      }
      await refreshDbProfile();
      setShowDoneOverlay(true);
      await new Promise((r) => setTimeout(r, 1500));
      setShowDoneOverlay(false);
      requestAnimationFrame(() => {
        router.replace(MAIN_TABS_HREF);
      });
    } finally {
      setSaving(false);
    }
  }, [user?.id, buildPayload, refreshDbProfile, router]);

  const handlePlaidSuccess = async (account: ExchangeAccountPayload) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    linkAccount(exchangePayloadToLinkedAccount(account));
    if (useStore.getState().roundUpTransactions.length === 0) {
      setRoundUpTransactions([...mockTransactions]);
    }
    updateRoundUpSummary({ ...mockRoundUpSummary });
    setPlaidLinked(true);
    setBankLinkedPulse(true);
    Animated.spring(checkScale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
    await new Promise((r) => setTimeout(r, 900));
    await completeAndExit();
  };

  const skipBank = () => {
    void Haptics.selectionAsync();
    void completeAndExit();
  };

  const canNextStep0 = firstName.trim().length >= 1;
  const canNextStep1 = causes.length >= 1;

  const progress = (step + 1) / STEPS;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={styles.header}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.headerRow}>
            {step > 0 ? (
              <TouchableOpacity onPress={goBack} hitSlop={12} style={styles.backBtn}>
                <Text style={styles.backLabel}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.backBtn} />
            )}
            <Text style={styles.stepMeta}>
              Step {step + 1} of {STEPS}
            </Text>
            {step === 2 ? (
              <TouchableOpacity onPress={skipMonthlyGoal} hitSlop={12}>
                <Text style={styles.skipSmall}>Skip</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 48 }} />
            )}
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          keyboardShouldPersistTaps="handled"
          showsHorizontalScrollIndicator={false}
          style={styles.stepPager}
          onMomentumScrollEnd={(e) =>
            onScrollEnd(e.nativeEvent.contentOffset.x)
          }
          scrollEventThrottle={16}
        >
          {/* Step 0 — Welcome & name */}
          <View style={[styles.page, { width: SCREEN_W }]}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Welcome to OneMore 🌱</Text>
              <Text style={styles.cardSubtitle}>
                Let&apos;s set up your profile in under a minute.
              </Text>
              <Text style={styles.fieldLabel}>First name</Text>
              <TextInput
                ref={nameInputRef}
                style={styles.input}
                placeholder="Your first name"
                placeholderTextColor="rgba(27,58,45,0.4)"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              <Text style={styles.fieldLabel}>Last name (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Last name"
                placeholderTextColor="rgba(27,58,45,0.4)"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, !canNextStep0 && styles.primaryBtnDisabled]}
              disabled={!canNextStep0}
              onPress={goNext}
            >
              <Text style={styles.primaryBtnText}>Next</Text>
            </TouchableOpacity>
          </View>

          {/* Step 1 — Causes */}
          <View style={[styles.page, { width: SCREEN_W }]}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>What matters most to you?</Text>
              <Text style={styles.cardSubtitle}>
                Pick one or more causes you care about.
              </Text>
              <View style={styles.pillWrap}>
                {CAUSE_IDS.map((id) => {
                  const selected = causes.includes(id);
                  const { emoji, label } = CAUSE_LABELS[id];
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[styles.pill, selected && styles.pillSelected]}
                      onPress={() => toggleCause(id)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                        {emoji} {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, !canNextStep1 && styles.primaryBtnDisabled]}
              disabled={!canNextStep1}
              onPress={goNext}
            >
              <Text style={styles.primaryBtnText}>Next</Text>
            </TouchableOpacity>
          </View>

          {/* Step 2 — Monthly goal */}
          <View style={[styles.page, { width: SCREEN_W }]}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Set your impact goal</Text>
              <Text style={styles.cardSubtitle}>
                How many trees do you want to plant each month?
              </Text>
              <View style={styles.goalList}>
                {TREE_GOAL_OPTIONS.map((n) => {
                  const selected = monthlyGoal === n;
                  return (
                    <TouchableOpacity
                      key={n}
                      style={[styles.goalRow, selected && styles.goalRowSelected]}
                      onPress={() => {
                        void Haptics.selectionAsync();
                        setMonthlyGoal(n);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.goalTrees, selected && styles.goalTreesSelected]}>
                        {n} trees / month
                      </Text>
                      <Text style={[styles.goalUsd, selected && styles.goalUsdSelected]}>
                        ~${n}/mo
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.hintMuted}>
                You can change this anytime in Settings.
              </Text>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={goNext}>
              <Text style={styles.primaryBtnText}>Next</Text>
            </TouchableOpacity>
          </View>

          {/* Step 3 — How round-ups work */}
          <View style={[styles.page, { width: SCREEN_W }]}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Here&apos;s how it works</Text>
              <Text style={styles.cardSubtitle}>
                Every purchase rounds up. Every cent plants trees.
              </Text>
              <View style={styles.miniCard}>
                <Text style={styles.miniEmoji}>☕</Text>
                <Text style={styles.miniTitle}>Coffee $4.23 → $5.00</Text>
                <Text style={styles.miniBody}>$0.77 goes toward your forest 🌲</Text>
              </View>
              <View style={styles.miniCard}>
                <Text style={styles.miniEmoji}>🪙</Text>
                <Text style={styles.miniTitle}>Spare change adds up</Text>
                <Text style={styles.miniBody}>Small round-ups become real trees.</Text>
              </View>
              <View style={styles.miniCard}>
                <Text style={styles.miniEmoji}>🌱</Text>
                <Text style={styles.miniTitle}>Your change becomes real change.</Text>
                <Text style={styles.miniBody}>Transparent impact you can track.</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.primaryBtn} onPress={goNext}>
              <Text style={styles.primaryBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>

          {/* Step 4 — Bank */}
          <View style={[styles.page, { width: SCREEN_W }]}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Connect your bank to start</Text>
              <Text style={styles.cardSubtitle}>
                We use Plaid to securely read your transactions. We never store your
                credentials.
              </Text>
              {bankLinkedPulse ? (
                <View style={styles.linkedBanner}>
                  <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                    <Text style={styles.linkedCheck}>✓</Text>
                  </Animated.View>
                  <Text style={styles.linkedText}>Bank connected!</Text>
                  <ActivityIndicator color={PRIMARY} style={{ marginTop: spacing.sm }} />
                </View>
              ) : (
                <PlaidLinkButton
                  onSuccess={handlePlaidSuccess}
                  label="Connect Bank Account"
                  style={[styles.plaidBtn, { backgroundColor: PRIMARY }]}
                />
              )}
              <TouchableOpacity
                onPress={skipBank}
                disabled={saving || bankLinkedPulse}
                style={styles.skipLinkWrap}
              >
                <Text style={styles.skipLink}>Skip for now</Text>
              </TouchableOpacity>
              <View style={styles.trustBlock}>
                <Text style={styles.trustLine}>🔒 Bank-level 256-bit encryption</Text>
                <Text style={styles.trustLine}>
                  🛡️ Read-only access — we can&apos;t move your money
                </Text>
                <Text style={styles.trustLineMuted}>
                  Trusted by 10,000+ apps via Plaid
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showDoneOverlay} transparent animationType="fade">
        <View style={styles.overlay}>
          <Text style={styles.overlayEmoji}>🎉</Text>
          <Text style={styles.overlayTitle}>You&apos;re all set!</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  stepPager: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { minWidth: 56 },
  backLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: CREAM,
  },
  stepMeta: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: SUBTEXT_ON_DARK,
  },
  skipSmall: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: SUBTEXT_ON_DARK,
    minWidth: 48,
    textAlign: "right",
  },
  page: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    flex: 1,
    backgroundColor: CREAM,
    borderRadius: radii.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  cardTitle: {
    fontFamily: fontFamily.display,
    fontSize: 26,
    color: PANEL_TEXT,
    marginBottom: spacing.sm,
  },
  cardSubtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: "rgba(27,58,45,0.75)",
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: PANEL_TEXT,
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(46,125,50,0.25)",
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    marginBottom: spacing.md,
    color: PANEL_TEXT,
  },
  primaryBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: spacing.md + 2,
    alignItems: "center",
    minHeight: 52,
    justifyContent: "center",
  },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryBtnText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.lg,
    color: "#fff",
  },
  pillWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  pill: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: "transparent",
  },
  pillSelected: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  pillText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: PRIMARY,
  },
  pillTextSelected: { color: "#fff" },
  goalList: { gap: spacing.sm },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: "rgba(46,125,50,0.35)",
    backgroundColor: "#fff",
  },
  goalRowSelected: {
    borderColor: PRIMARY,
    backgroundColor: "rgba(46,125,50,0.12)",
  },
  goalTrees: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: PANEL_TEXT,
  },
  goalTreesSelected: { color: PRIMARY },
  goalUsd: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: "rgba(27,58,45,0.6)",
  },
  goalUsdSelected: { color: PRIMARY },
  hintMuted: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: "rgba(27,58,45,0.55)",
    marginTop: spacing.md,
    textAlign: "center",
  },
  miniCard: {
    backgroundColor: "#fff",
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "rgba(46,125,50,0.2)",
  },
  miniEmoji: { fontSize: 28, marginBottom: spacing.xs },
  miniTitle: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: PANEL_TEXT,
    marginBottom: 4,
  },
  miniBody: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: "rgba(27,58,45,0.7)",
    lineHeight: 20,
  },
  plaidBtn: { width: "100%" },
  skipLinkWrap: { alignItems: "center", paddingVertical: spacing.md },
  skipLink: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: PRIMARY,
    textDecorationLine: "underline",
  },
  trustBlock: { marginTop: spacing.md, gap: spacing.xs },
  trustLine: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: "rgba(27,58,45,0.85)",
  },
  trustLineMuted: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: "rgba(27,58,45,0.55)",
    marginTop: spacing.xs,
  },
  linkedBanner: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  linkedCheck: {
    fontSize: 56,
    color: PRIMARY,
    fontFamily: fontFamily.bodyBold,
  },
  linkedText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.lg,
    color: PANEL_TEXT,
    marginTop: spacing.sm,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(27,58,45,0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  overlayEmoji: { fontSize: 56, marginBottom: spacing.md },
  overlayTitle: {
    fontFamily: fontFamily.display,
    fontSize: fontSize["3xl"],
    color: CREAM,
    textAlign: "center",
  },
});

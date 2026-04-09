import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
  ActionSheetIOS,
  Platform,
  Image,
  ActivityIndicator,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { colors } from "../../constants/colors";
import { fontFamily, fontSize } from "../../constants/typography";
import { spacing, radii } from "../../constants/spacing";
import { useStore } from "../../store/useStore";
import { getTier } from "../../constants/tiers";
import { PersonIcon, LeafIcon } from "../../components/icons/TabIcons";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Toast } from "../../components/ui/Toast";
import { formatCurrency } from "../../utils/format";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthContext";
import { isSupabaseConfigured } from "../../services/supabase";
import { updateProfileFields } from "../../services/profile";
import {
  CAUSE_IDS,
  CAUSE_LABELS,
  TREE_GOAL_OPTIONS,
  type CauseId,
} from "../../types/profile";

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SettingsRow({
  label,
  value,
  onPress,
  chevron = true,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  chevron?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <Text style={styles.settingsLabel}>{label}</Text>
      <Text style={styles.settingsValue}>{value ?? (chevron ? "›" : "")}</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, signOut, dbProfile, refreshDbProfile } = useAuth();
  const {
    profile,
    stats,
    donationHistory,
    roundUpSettings,
    setMultiplier,
    setThreshold,
    togglePause,
    setAvatar,
    isPlaidLinked,
    linkedAccounts,
    roundUpTransactions,
    roundUpSummary,
  } = useStore();
  const tier = getTier(stats.treesPlanted);
  const [notifRoundups, setNotifRoundups] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(true);
  const [notifMilestones, setNotifMilestones] = useState(true);
  const [notifPartners, setNotifPartners] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [roundUpSheet, setRoundUpSheet] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [eFirst, setEFirst] = useState("");
  const [eLast, setELast] = useState("");
  const [eCauses, setECauses] = useState<CauseId[]>([]);
  const [eGoal, setEGoal] = useState(10);
  const [eSaving, setESaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (isSupabaseConfigured()) void refreshDbProfile();
    }, [refreshDbProfile]),
  );

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
  }, []);

  // Task 1: Avatar edit
  const handleAvatarEdit = () => {
    const options = ["Take Photo", "Choose from Library", "Remove Photo", "Cancel"];
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 3, destructiveButtonIndex: 2 },
        (idx) => {
          if (idx === 0) pickImage("camera");
          else if (idx === 1) pickImage("library");
          else if (idx === 2) { setAvatar(undefined); showToast("Photo removed"); }
        }
      );
    } else {
      Alert.alert("Change Photo", undefined, [
        { text: "Take Photo", onPress: () => pickImage("camera") },
        { text: "Choose from Library", onPress: () => pickImage("library") },
        { text: "Remove Photo", style: "destructive", onPress: () => { setAvatar(undefined); showToast("Photo removed"); } },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const pickImage = async (source: "camera" | "library") => {
    const permResult = source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert("Permission needed", `Please allow ${source} access in Settings.`);
      return;
    }
    setAvatarLoading(true);
    try {
      const result = source === "camera"
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
        showToast("Photo updated");
      }
    } finally {
      setAvatarLoading(false);
    }
  };

  // Task 2: Share referral
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on OneMore! Use my code ${profile.referralCode} and we both get 5 bonus trees 🌳 https://onemore.earth/download`,
      });
    } catch {}
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(profile.referralCode);
    showToast("Code copied!");
  };

  // Task 9: Settings actions
  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  const handleSupport = () => {
    Linking.openURL("mailto:support@onemore.app?subject=OneMore%20Support");
  };

  const handlePrivacy = () => {
    WebBrowser.openBrowserAsync("https://onemore.earth/privacy");
  };

  const handleTerms = () => {
    WebBrowser.openBrowserAsync("https://onemore.earth/terms");
  };

  const displayNameFromDb =
    dbProfile &&
    [dbProfile.first_name, dbProfile.last_name].filter(Boolean).join(" ").trim();
  const displayName = displayNameFromDb || profile.name;

  const openEditProfile = () => {
    if (!isSupabaseConfigured() || !user?.id) {
      Alert.alert("Unavailable", "Sign in with Supabase to sync your profile.");
      return;
    }
    setEFirst(dbProfile?.first_name ?? "");
    setELast(dbProfile?.last_name ?? "");
    const known = dbProfile?.causes.filter((c): c is CauseId =>
      (CAUSE_IDS as readonly string[]).includes(c),
    );
    setECauses(known ?? []);
    setEGoal(dbProfile?.monthly_tree_goal ?? 10);
    setEditProfileOpen(true);
  };

  const toggleEditCause = (id: CauseId) => {
    setECauses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const saveEditProfile = async () => {
    if (!user?.id) return;
    setESaving(true);
    try {
      const { error } = await updateProfileFields(user.id, {
        first_name: eFirst.trim() || null,
        last_name: eLast.trim() || null,
        causes: [...eCauses],
        monthly_tree_goal: eGoal,
      });
      if (error) {
        Alert.alert("Could not save", error.message);
        return;
      }
      await refreshDbProfile();
      showToast("Profile updated");
      setEditProfileOpen(false);
    } finally {
      setESaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              {avatarLoading ? (
                <ActivityIndicator color={colors.brightGreen} size="large" />
              ) : profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
              ) : (
                <PersonIcon size={36} color={colors.white} />
              )}
            </View>
            <TouchableOpacity style={styles.editBadge} onPress={handleAvatarEdit}>
              <Text style={styles.editBadgeText}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          {user?.email ? (
            <Text style={styles.userEmail}>{user.email}</Text>
          ) : null}
          <View style={styles.tierRow}>
            <Text style={[styles.tierText, { color: tier.color }]}>
              {tier.icon} {tier.name}
            </Text>
          </View>
          <Text style={styles.memberSince}>
            Member since {stats.memberSince}
          </Text>
        </View>

        {isSupabaseConfigured() && dbProfile ? (
          <>
            <SectionHeader title="Your impact preferences" />
            <TouchableOpacity
              style={styles.prefsCard}
              onPress={openEditProfile}
              activeOpacity={0.85}
            >
              <Text style={styles.prefsHint}>Tap any row to edit</Text>
              <View style={styles.prefsRow}>
                <Text style={styles.prefsLabel}>Name</Text>
                <Text style={styles.prefsValue} numberOfLines={1}>
                  {displayName}
                </Text>
              </View>
              <View style={styles.prefsRow}>
                <Text style={styles.prefsLabel}>Causes</Text>
                <View style={styles.prefsPillRow}>
                  {dbProfile.causes.length === 0 ? (
                    <Text style={styles.prefsMuted}>None selected</Text>
                  ) : (
                    dbProfile.causes.map((c) => {
                      const meta = (CAUSE_IDS as readonly string[]).includes(c)
                        ? CAUSE_LABELS[c as CauseId]
                        : null;
                      return (
                        <View key={c} style={styles.prefsPill}>
                          <Text style={styles.prefsPillText}>
                            {meta ? `${meta.emoji} ${meta.label}` : c}
                          </Text>
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
              <View style={styles.prefsRow}>
                <Text style={styles.prefsLabel}>Monthly tree goal</Text>
                <Text style={styles.prefsValue}>
                  {dbProfile.monthly_tree_goal} trees / mo (~$
                  {dbProfile.monthly_tree_goal}/mo)
                </Text>
              </View>
            </TouchableOpacity>
          </>
        ) : null}

        {/* Stats summary */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.treesPlanted}</Text>
            <Text style={styles.statLabel}>Trees</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              ${stats.totalDonated.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>Donated</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalRoundups}</Text>
            <Text style={styles.statLabel}>Round-Ups</Text>
          </View>
        </View>

        {/* Bank & round-ups (mock Plaid flow) */}
        {!isPlaidLinked ? (
          <LinearGradient
            colors={[colors.forest, colors.deepGreen]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bankBanner}
          >
            <Text style={styles.bankBannerTitle}>Connect Your Bank</Text>
            <Text style={styles.bankBannerDesc}>
              Link your account to start rounding up purchases for the planet.
            </Text>
            <TouchableOpacity
              style={styles.bankBannerBtn}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push("/connect-bank");
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.bankBannerBtnText}>Connect Bank</Text>
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          <>
            <SectionHeader title="Your Accounts" />
            <TouchableOpacity
              style={styles.accountsCard}
              onPress={() => router.push("/linked-accounts")}
              activeOpacity={0.85}
            >
              <View style={styles.accountsCardLeft}>
                <Text style={styles.accountsEmoji}>🏦</Text>
                <View>
                  <Text style={styles.accountsTitle}>
                    {linkedAccounts.length} account
                    {linkedAccounts.length === 1 ? "" : "s"} linked
                    {linkedAccounts.some((a) => a.isActive)
                      ? " · Round-ups active"
                      : " · Round-ups paused"}
                  </Text>
                  <Text style={styles.accountsPending}>
                    Pending: {formatCurrency(roundUpSummary.pendingDonation)} /{" "}
                    {formatCurrency(roundUpSummary.donationThreshold)}
                  </Text>
                </View>
              </View>
              <Text style={styles.accountsChevron}>›</Text>
            </TouchableOpacity>

            <SectionHeader title="Round-Up Activity" />
            <View style={styles.activityCard}>
              {roundUpTransactions.length === 0 ? (
                <Text style={styles.activityEmpty}>
                  No round-ups yet — they’ll appear here after you shop with a linked account.
                </Text>
              ) : (
                roundUpTransactions
                  .slice()
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 3)
                  .map((tx) => (
                    <View key={tx.id} style={styles.activityRow}>
                      <Text style={styles.activityMerchant} numberOfLines={1}>
                        {tx.merchantName}
                      </Text>
                      <Text style={styles.activityRoundup}>
                        +{formatCurrency(tx.roundUpAmount)}
                      </Text>
                    </View>
                  ))
              )}
              <TouchableOpacity
                onPress={() => router.push("/round-ups")}
                style={styles.viewAllRow}
              >
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Referral card — Task 2 */}
        <TouchableOpacity style={styles.referralCard} onPress={handleShare} activeOpacity={0.8}>
          <View style={styles.referralIcon}>
            <LeafIcon size={24} color={colors.white} />
          </View>
          <View style={styles.referralInfo}>
            <Text style={styles.referralTitle}>Invite friends</Text>
            <Text style={styles.referralDesc}>
              You both get 5 bonus trees
            </Text>
          </View>
          <TouchableOpacity style={styles.referralCodeBadge} onPress={handleCopyCode} activeOpacity={0.6}>
            <Text style={styles.referralCode}>{profile.referralCode}</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Donation history */}
        <SectionHeader title="Donation History" />
        <TouchableOpacity
          style={styles.expandRow}
          onPress={() => setHistoryExpanded(!historyExpanded)}
        >
          <Text style={styles.expandText}>
            {historyExpanded ? "Hide details" : "Show monthly breakdown"}
          </Text>
          <Text style={styles.expandArrow}>
            {historyExpanded ? "▲" : "▼"}
          </Text>
        </TouchableOpacity>
        {historyExpanded &&
          donationHistory.map((dh, i) => (
            <View key={i} style={styles.historyRow}>
              <Text style={styles.historyMonth}>{dh.month}</Text>
              <View style={styles.historyRight}>
                <Text style={styles.historyAmount}>
                  ${dh.total.toFixed(2)}
                </Text>
                <Text style={styles.historyMeta}>
                  {dh.trees} trees · {dh.roundups} round-ups
                </Text>
              </View>
            </View>
          ))}

        {/* Settings — Task 9 */}
        <SectionHeader title="Round-Up Preferences" />
        <SettingsRow
          label="Round-Up Multiplier"
          value={`${roundUpSettings.multiplier}×`}
          onPress={() => setRoundUpSheet(true)}
        />
        <SettingsRow
          label="Charge Threshold"
          value={`$${roundUpSettings.threshold}`}
          onPress={() => setRoundUpSheet(true)}
        />

        <SectionHeader title="Notifications" />
        <View style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>Round-up confirmations</Text>
          <Switch
            value={notifRoundups}
            onValueChange={setNotifRoundups}
            trackColor={{ false: colors.paleGreen, true: colors.brightGreen }}
            thumbColor={colors.white}
          />
        </View>
        <View style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>Weekly summary</Text>
          <Switch
            value={notifWeekly}
            onValueChange={setNotifWeekly}
            trackColor={{ false: colors.paleGreen, true: colors.brightGreen }}
            thumbColor={colors.white}
          />
        </View>
        <View style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>Milestone alerts</Text>
          <Switch
            value={notifMilestones}
            onValueChange={setNotifMilestones}
            trackColor={{ false: colors.paleGreen, true: colors.brightGreen }}
            thumbColor={colors.white}
          />
        </View>
        <View style={styles.settingsRow}>
          <Text style={styles.settingsLabel}>Partner deals nearby</Text>
          <Switch
            value={notifPartners}
            onValueChange={setNotifPartners}
            trackColor={{ false: colors.paleGreen, true: colors.brightGreen }}
            thumbColor={colors.white}
          />
        </View>

        <SectionHeader title="More" />
        <SettingsRow label="Share Referral Link" onPress={handleShare} />
        <SettingsRow label="Privacy Policy" onPress={handlePrivacy} />
        <SettingsRow label="Terms of Service" onPress={handleTerms} />
        <SettingsRow label="Help & Support" onPress={handleSupport} />

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      <BottomSheet
        visible={roundUpSheet}
        onClose={() => setRoundUpSheet(false)}
        settings={roundUpSettings}
        onMultiplier={setMultiplier}
        onThreshold={setThreshold}
        onTogglePause={togglePause}
      />

      <Toast
        message={toastMsg}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />

      <Modal
        visible={editProfileOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditProfileOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <KeyboardAvoidingView
            style={styles.modalFlex}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setEditProfileOpen(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit profile</Text>
              <TouchableOpacity onPress={saveEditProfile} disabled={eSaving}>
                <Text style={[styles.modalSave, eSaving && { opacity: 0.5 }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              contentContainerStyle={styles.modalScroll}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.modalLabel}>First name</Text>
              <TextInput
                style={styles.modalInput}
                value={eFirst}
                onChangeText={setEFirst}
                placeholder="First name"
                placeholderTextColor={colors.sage}
              />
              <Text style={styles.modalLabel}>Last name</Text>
              <TextInput
                style={styles.modalInput}
                value={eLast}
                onChangeText={setELast}
                placeholder="Last name"
                placeholderTextColor={colors.sage}
              />
              <Text style={styles.modalLabel}>Causes you care about</Text>
              <View style={styles.modalPillWrap}>
                {CAUSE_IDS.map((id) => {
                  const on = eCauses.includes(id);
                  const { emoji, label } = CAUSE_LABELS[id];
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[styles.modalPill, on && styles.modalPillOn]}
                      onPress={() => toggleEditCause(id)}
                    >
                      <Text style={[styles.modalPillText, on && styles.modalPillTextOn]}>
                        {emoji} {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.modalLabel}>Monthly tree goal</Text>
              {TREE_GOAL_OPTIONS.map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[
                    styles.modalGoalRow,
                    eGoal === n && styles.modalGoalRowOn,
                  ]}
                  onPress={() => setEGoal(n)}
                >
                  <Text
                    style={[
                      styles.modalGoalText,
                      eGoal === n && styles.modalGoalTextOn,
                    ]}
                  >
                    {n} trees / mo (~${n}/mo)
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.warmWhite },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  profileCard: { alignItems: "center", paddingVertical: spacing.lg, marginBottom: spacing.md },
  avatarWrap: { marginBottom: spacing.md },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.forest, justifyContent: "center", alignItems: "center", overflow: "hidden",
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  editBadge: {
    position: "absolute", bottom: 0, right: -4, width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.cream, justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: colors.warmWhite,
  },
  editBadgeText: { fontSize: 14 },
  displayName: { fontFamily: fontFamily.display, fontSize: fontSize["3xl"], color: colors.bark, marginBottom: 4 },
  userEmail: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.sage,
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  tierRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  tierText: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm },
  memberSince: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.sage },
  statsRow: {
    flexDirection: "row", backgroundColor: colors.cream, borderRadius: radii.lg,
    padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.paleGreen,
  },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: colors.paleGreen },
  statNumber: { fontFamily: fontFamily.display, fontSize: fontSize["2xl"], color: colors.bark },
  statLabel: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.earth, marginTop: 2 },
  referralCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: colors.brightGreen,
    borderRadius: radii.lg, padding: spacing.md, marginBottom: spacing.lg,
  },
  referralIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center", marginRight: spacing.sm + 2,
  },
  referralInfo: { flex: 1 },
  referralTitle: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.md, color: colors.white },
  referralDesc: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: "rgba(255,255,255,0.85)" },
  referralCodeBadge: {
    backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs, borderRadius: radii.sm,
  },
  referralCode: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.xs, color: colors.white },
  bankBanner: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  bankBannerTitle: {
    fontFamily: fontFamily.display,
    fontSize: fontSize["2xl"],
    color: colors.white,
    marginBottom: spacing.xs,
  },
  bankBannerDesc: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.sage,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  bankBannerBtn: {
    backgroundColor: colors.brightGreen,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 2,
    alignItems: "center",
  },
  bankBannerBtnText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.white,
  },
  accountsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.paleGreen,
  },
  accountsCardLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  accountsEmoji: { fontSize: 28 },
  accountsTitle: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.bark,
  },
  accountsPending: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.earth,
    marginTop: 2,
  },
  accountsChevron: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xl,
    color: colors.sage,
  },
  activityCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.paleGreen,
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212,232,209,0.5)",
  },
  activityMerchant: {
    flex: 1,
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.bark,
    marginRight: spacing.sm,
  },
  activityRoundup: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.brightGreen,
  },
  activityEmpty: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.earth,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  viewAllRow: { paddingTop: spacing.sm, alignItems: "flex-end" },
  viewAll: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.brightGreen,
  },
  sectionHeader: {
    fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.lg, color: colors.bark,
    marginBottom: spacing.sm, marginTop: spacing.md,
  },
  expandRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.cream, borderRadius: radii.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  expandText: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.sm, color: colors.brightGreen },
  expandArrow: { fontSize: 12, color: colors.brightGreen },
  historyRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: "rgba(212,232,209,0.3)",
  },
  historyMonth: { fontFamily: fontFamily.body, fontSize: fontSize.md, color: colors.bark },
  historyRight: { alignItems: "flex-end" },
  historyAmount: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.md, color: colors.bark },
  historyMeta: { fontFamily: fontFamily.body, fontSize: fontSize.xs, color: colors.earth },
  settingsRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: spacing.md, paddingHorizontal: spacing.sm,
    borderBottomWidth: 1, borderBottomColor: "rgba(212,232,209,0.3)",
  },
  settingsLabel: { fontFamily: fontFamily.body, fontSize: fontSize.md, color: colors.bark },
  settingsValue: { fontFamily: fontFamily.body, fontSize: fontSize.md, color: colors.sage },
  signOutBtn: {
    marginTop: spacing.xl, paddingVertical: spacing.md, alignItems: "center",
    borderRadius: radii.md, borderWidth: 1, borderColor: colors.danger,
  },
  signOutText: { fontFamily: fontFamily.bodySemiBold, fontSize: fontSize.md, color: colors.danger },
  prefsCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.paleGreen,
  },
  prefsHint: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.sage,
    marginBottom: spacing.sm,
  },
  prefsRow: { marginBottom: spacing.md },
  prefsLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.earth,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  prefsValue: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.bark,
  },
  prefsMuted: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.sage,
  },
  prefsPillRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  prefsPill: {
    backgroundColor: colors.paleGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.md,
  },
  prefsPillText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.forest,
  },
  modalSafe: { flex: 1, backgroundColor: colors.warmWhite },
  modalFlex: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.paleGreen,
  },
  modalCancel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.earth,
    width: 72,
  },
  modalTitle: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.bark,
  },
  modalSave: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.brightGreen,
    width: 72,
    textAlign: "right",
  },
  modalScroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  modalLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.bark,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  modalInput: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.paleGreen,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.bark,
    backgroundColor: colors.white,
  },
  modalPillWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  modalPill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.brightGreen,
  },
  modalPillOn: { backgroundColor: colors.brightGreen, borderColor: colors.brightGreen },
  modalPillText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.brightGreen,
  },
  modalPillTextOn: { color: colors.white },
  modalGoalRow: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.paleGreen,
    marginBottom: spacing.xs,
    backgroundColor: colors.white,
  },
  modalGoalRowOn: {
    borderColor: colors.brightGreen,
    backgroundColor: colors.paleGreen,
  },
  modalGoalText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.bark,
  },
  modalGoalTextOn: {
    fontFamily: fontFamily.bodySemiBold,
    color: colors.forest,
  },
});

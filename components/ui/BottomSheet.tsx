import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  Switch,
} from "react-native";
import { colors } from "../../constants/colors";
import { fontFamily, fontSize } from "../../constants/typography";
import { spacing, radii } from "../../constants/spacing";
import { RoundUpSettings } from "../../types";

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  settings: RoundUpSettings;
  onMultiplier: (m: RoundUpSettings["multiplier"]) => void;
  onThreshold: (t: RoundUpSettings["threshold"]) => void;
  onTogglePause: () => void;
}

const multipliers: RoundUpSettings["multiplier"][] = [1, 2, 3, 5];
const thresholds: RoundUpSettings["threshold"][] = [5, 10, 15, 25];

function SegmentedControl<T extends number>({
  options,
  value,
  onChange,
  prefix,
  suffix,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <TouchableOpacity
            key={opt}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(opt)}
          >
            <Text
              style={[styles.segmentText, active && styles.segmentTextActive]}
            >
              {prefix}
              {opt}
              {suffix}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function BottomSheet({
  visible,
  onClose,
  settings,
  onMultiplier,
  onThreshold,
  onTogglePause,
}: BottomSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Round-Up Settings</Text>

        <Text style={styles.sectionLabel}>Round-Up Multiplier</Text>
        <SegmentedControl
          options={multipliers}
          value={settings.multiplier}
          onChange={onMultiplier}
          suffix="x"
        />

        <Text style={styles.sectionLabel}>Charge Threshold</Text>
        <SegmentedControl
          options={thresholds}
          value={settings.threshold}
          onChange={onThreshold}
          prefix="$"
        />

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Pause Round-Ups</Text>
          <Switch
            value={settings.paused}
            onValueChange={onTogglePause}
            trackColor={{ false: colors.paleGreen, true: colors.brightGreen }}
            thumbColor={colors.white}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    backgroundColor: colors.warmWhite,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.paleGreen,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.bark,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.earth,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  segmented: {
    flexDirection: "row",
    backgroundColor: colors.cream,
    borderRadius: radii.md,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.sm,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: colors.brightGreen,
  },
  segmentText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.earth,
  },
  segmentTextActive: {
    color: colors.white,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.paleGreen,
  },
  toggleLabel: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.bark,
  },
});

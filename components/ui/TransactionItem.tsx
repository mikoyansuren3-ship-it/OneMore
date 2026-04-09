import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Circle as SvgCircle, Path } from "react-native-svg";
import { colors } from "../../constants/colors";
import { fontFamily, fontSize } from "../../constants/typography";
import { spacing } from "../../constants/spacing";
import { Transaction } from "../../types";
import { LeafIcon } from "../icons/TabIcons";

function InfoIcon({ size = 14, color = colors.gold }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <SvgCircle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
      <Path d="M12 16v-4M12 8h.01" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  onDoubleImpactInfo?: () => void;
}

export function TransactionItem({ transaction, onDoubleImpactInfo }: TransactionItemProps) {
  const { merchant, amount, roundup, time, isPartner } = transaction;

  return (
    <View style={styles.row}>
      <View style={styles.iconCircle}>
        <LeafIcon size={18} color={colors.leaf} />
      </View>
      <View style={styles.middle}>
        <Text style={styles.merchant}>{merchant}</Text>
        {isPartner && (
          <TouchableOpacity
            style={styles.partnerRow}
            onPress={onDoubleImpactInfo}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.partnerBadge}>Double Impact ✦</Text>
            <InfoIcon />
          </TouchableOpacity>
        )}
        <Text style={styles.time}>{time}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>${amount.toFixed(2)}</Text>
        <Text style={styles.roundup}>+${roundup.toFixed(2)}</Text>
        {isPartner && (
          <Text style={styles.matched}>Partner matched +${roundup.toFixed(2)}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(212,232,209,0.3)",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.deepGreen,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm + 4,
  },
  middle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  merchant: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.bark,
  },
  partnerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  partnerBadge: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.xs,
    color: colors.gold,
  },
  time: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.earth,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
  },
  amount: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.earth,
  },
  roundup: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.brightGreen,
    marginTop: 1,
  },
  matched: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.gold,
    marginTop: 2,
  },
});

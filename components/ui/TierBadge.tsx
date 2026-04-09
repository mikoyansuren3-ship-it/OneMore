import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { fontFamily, fontSize } from "../../constants/typography";
import { spacing } from "../../constants/spacing";
import { Tier } from "../../constants/tiers";

interface TierBadgeProps {
  tier: Tier;
  treesPlanted: number;
}

export function TierBadge({ tier, treesPlanted }: TierBadgeProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.text, { color: tier.color }]}>
        {tier.icon} {tier.name} · {treesPlanted} trees
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  },
});

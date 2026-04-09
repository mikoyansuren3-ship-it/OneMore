import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../constants/colors";
import { fontFamily, fontSize } from "../../constants/typography";
import { spacing, radii } from "../../constants/spacing";

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

export function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <View style={styles.card}>
      {icon}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.deepGreen,
    borderWidth: 1,
    borderColor: "rgba(45,107,63,0.2)",
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: "center",
    gap: 6,
  },
  value: {
    fontFamily: fontFamily.display,
    fontSize: fontSize["2xl"],
    color: colors.white,
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    color: colors.sage,
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
  },
});

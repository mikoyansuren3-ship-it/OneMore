import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../constants/colors";
import { fontFamily, fontSize } from "../../constants/typography";
import { spacing, radii } from "../../constants/spacing";
import { CO2Equivalent } from "../../types";
import {
  CarIcon,
  AirplaneIcon,
  PhoneIcon,
  BulbIcon,
} from "../icons/TabIcons";

const iconMap: Record<string, React.ReactNode> = {
  car: <CarIcon size={24} color={colors.gold} />,
  airplane: <AirplaneIcon size={24} color={colors.gold} />,
  "phone-portrait": <PhoneIcon size={24} color={colors.gold} />,
  bulb: <BulbIcon size={24} color={colors.gold} />,
};

interface EquivalentCardProps {
  equivalents: CO2Equivalent[];
  onTapEquivalent?: (eq: CO2Equivalent) => void;
}

export function EquivalentCard({ equivalents, onTapEquivalent }: EquivalentCardProps) {
  return (
    <LinearGradient
      colors={[colors.deepGreen, colors.forest]}
      style={styles.card}
    >
      <Text style={styles.header}>Your Impact Equals</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {equivalents.map((eq, i) => (
          <TouchableOpacity
            key={i}
            style={styles.item}
            activeOpacity={onTapEquivalent ? 0.7 : 1}
            onPress={() => onTapEquivalent?.(eq)}
          >
            {iconMap[eq.icon] ?? null}
            <Text style={styles.value}>{eq.value}</Text>
            <Text style={styles.description} numberOfLines={3}>
              {eq.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  header: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: colors.gold,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: spacing.md,
  },
  scrollContent: {
    gap: spacing.md,
  },
  item: {
    alignItems: "center",
    width: 100,
    gap: 4,
  },
  value: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
    color: colors.white,
    textAlign: "center",
  },
  description: {
    fontFamily: fontFamily.body,
    fontSize: 11,
    color: colors.sage,
    textAlign: "center",
    lineHeight: 14,
  },
});

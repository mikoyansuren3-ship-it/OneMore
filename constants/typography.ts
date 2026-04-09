import { TextStyle } from "react-native";

export const fontFamily = {
  display: "DMSerifDisplay_400Regular",
  body: "DMSans_400Regular",
  bodyMedium: "DMSans_500Medium",
  bodySemiBold: "DMSans_600SemiBold",
  bodyBold: "DMSans_700Bold",
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
} as const;

export const typography = {
  display5xl: {
    fontFamily: fontFamily.display,
    fontSize: fontSize["5xl"],
  } as TextStyle,
  display4xl: {
    fontFamily: fontFamily.display,
    fontSize: fontSize["4xl"],
  } as TextStyle,
  display3xl: {
    fontFamily: fontFamily.display,
    fontSize: fontSize["3xl"],
  } as TextStyle,
  display2xl: {
    fontFamily: fontFamily.display,
    fontSize: fontSize["2xl"],
  } as TextStyle,
  displayXl: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.xl,
  } as TextStyle,
  headingLg: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.lg,
  } as TextStyle,
  headingMd: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
  } as TextStyle,
  bodyLg: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.lg,
  } as TextStyle,
  bodyMd: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
  } as TextStyle,
  bodySm: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
  } as TextStyle,
  bodyXs: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
  } as TextStyle,
  labelSm: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
  } as TextStyle,
  labelXs: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  } as TextStyle,
} as const;

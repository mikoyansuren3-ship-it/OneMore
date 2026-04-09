import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../../constants/colors";
import { fontFamily, fontSize } from "../../constants/typography";

interface ProgressRingProps {
  size?: number;
  strokeWidth?: number;
  progress: number;
  value: string;
  label: string;
}

export function ProgressRing({
  size = 180,
  strokeWidth = 10,
  progress,
  value,
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animValue = useRef(new Animated.Value(0)).current;
  const [dashOffset, setDashOffset] = React.useState(circumference);

  useEffect(() => {
    const listener = animValue.addListener(({ value: v }) => {
      setDashOffset(circumference * (1 - v));
    });

    Animated.timing(animValue, {
      toValue: progress,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => animValue.removeListener(listener);
  }, [progress]);

  return (
    <View style={styles.container}>
      <View style={[styles.ringWrapper, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.deepGreen}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.brightGreen}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={styles.innerContent}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  ringWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  innerContent: {
    position: "absolute",
    alignItems: "center",
  },
  value: {
    fontFamily: fontFamily.display,
    fontSize: fontSize["4xl"],
    color: colors.white,
  },
  label: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.sage,
    marginTop: 2,
  },
});

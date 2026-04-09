import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Animated, Easing, LayoutChangeEvent } from "react-native";
import { colors } from "../../constants/colors";
import { fontFamily, fontSize } from "../../constants/typography";
import { spacing } from "../../constants/spacing";

function formatDollarsFromCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface TreeDollarProgressBarProps {
  nextTreeProgressCents: number;
  treeCostCents: number;
}

export function TreeDollarProgressBar({
  nextTreeProgressCents,
  treeCostCents,
}: TreeDollarProgressBarProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const fillWidth = useRef(new Animated.Value(0)).current;

  const pct = Math.min(
    Math.max(treeCostCents > 0 ? nextTreeProgressCents / treeCostCents : 0, 0),
    1
  );
  const remainingCents = Math.max(treeCostCents - nextTreeProgressCents, 0);

  const onTrackLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setTrackWidth(w);
    fillWidth.setValue(w * pct);
  };

  useEffect(() => {
    if (trackWidth <= 0) return;
    Animated.timing(fillWidth, {
      toValue: trackWidth * pct,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [pct, trackWidth, nextTreeProgressCents, treeCostCents]);

  const motivation =
    remainingCents <= 0
      ? "You've funded your next tree — it'll plant with the next batch!"
      : `${formatDollarsFromCents(remainingCents)} more until your next tree!`;

  return (
    <View style={styles.wrap}>
      <Text style={styles.primaryLine}>
        {formatDollarsFromCents(nextTreeProgressCents)} /{" "}
        {formatDollarsFromCents(treeCostCents)} toward your next tree
      </Text>

      <View style={styles.track} onLayout={onTrackLayout}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: fillWidth,
            },
          ]}
        />
      </View>

      <Text style={styles.motivation}>{motivation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    marginTop: spacing.lg,
  },
  primaryLine: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  track: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.brightGreen,
  },
  motivation: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.lightLeaf,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});

import React from "react";
import { View, Text, StyleSheet, Modal, Pressable } from "react-native";
import { colors } from "../../constants/colors";
import { fontFamily, fontSize } from "../../constants/typography";
import { spacing, radii } from "../../constants/spacing";

interface InfoSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  body: string;
  detail?: string;
}

export function InfoSheet({ visible, onClose, title, body, detail }: InfoSheetProps) {
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
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
        {detail && <Text style={styles.detail}>{detail}</Text>}
        <Pressable style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>Got it</Text>
        </Pressable>
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
    marginBottom: spacing.sm,
  },
  body: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.earth,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  detail: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.sage,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  closeBtn: {
    backgroundColor: colors.brightGreen,
    borderRadius: radii.md,
    paddingVertical: spacing.sm + 4,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  closeBtnText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.white,
  },
});

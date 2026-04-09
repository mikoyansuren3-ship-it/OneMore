import React, { useCallback, useState } from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  View,
} from "react-native";
import {
  create,
  open as plaidOpen,
  dismissLink,
  LinkIOSPresentationStyle,
} from "react-native-plaid-link-sdk";
import type { LinkExit, LinkOpenProps, LinkSuccess } from "react-native-plaid-link-sdk";
import { createLinkToken, exchangePublicToken } from "../services/plaid";
import { colors } from "../constants/colors";
import { fontFamily, fontSize } from "../constants/typography";
import { spacing, radii } from "../constants/spacing";

/** Discriminated result matching the v12+ Promise-style flow; implemented via LinkOpenProps callbacks (see openPlaidSession). */
type PlaidOpenResult = ({ success: true } & LinkSuccess) | ({ success: false } & LinkExit);

/**
 * react-native-plaid-link-sdk@12.8.0 types `open` as `(props: LinkOpenProps) => void` with required onSuccess/onExit.
 * This wraps those callbacks in a Promise with a success/exit discriminant.
 */
function openPlaidSession(
  options: Pick<LinkOpenProps, "iOSPresentationStyle" | "logLevel"> = {},
): Promise<PlaidOpenResult> {
  return new Promise((resolve) => {
    plaidOpen({
      ...options,
      onSuccess: (linkSuccess) => {
        console.log(
          "🔍 [PLAID-LINK] Native onSuccess fired — publicToken prefix:",
          linkSuccess.publicToken?.slice(0, 12),
        );
        resolve({ success: true, publicToken: linkSuccess.publicToken, metadata: linkSuccess.metadata });
      },
      onExit: (linkExit) => {
        console.log("🔍 [PLAID-LINK] Native onExit fired:", {
          hasError: !!linkExit.error,
          status: linkExit.metadata?.status,
        });
        resolve({ success: false, error: linkExit.error, metadata: linkExit.metadata });
      },
    });
  });
}

export interface PlaidLinkButtonProps {
  onSuccess?: (account: Awaited<ReturnType<typeof exchangePublicToken>>["account"]) => void;
  onError?: (error: Error) => void;
  label?: string;
  style?: object;
}

export function PlaidLinkButton({
  onSuccess,
  onError,
  label = "Connect with Plaid",
  style,
}: PlaidLinkButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePress = useCallback(async () => {
    if (Platform.OS === "web") {
      Alert.alert("Not available", "Plaid Link runs on iOS and Android dev builds only.");
      return;
    }

    try {
      setLoading(true);
      console.log("🔍 [PLAID-LINK] Step 1: Getting link token...");
      const linkToken = await createLinkToken();
      console.log("🔍 [PLAID-LINK] Step 2: Got link token:", linkToken?.slice(0, 30));

      console.log("🔍 [PLAID-LINK] Step 3: Calling dismissLink() (iOS) before create...");
      dismissLink();
      console.log("🔍 [PLAID-LINK] Step 4: Calling create()...");
      create({ token: linkToken });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("🔍 [PLAID-LINK] Step 5: Post-create delay done, calling open...");

      const result = await openPlaidSession({
        iOSPresentationStyle: LinkIOSPresentationStyle.FULL_SCREEN,
      });
      console.log("🔍 [PLAID-LINK] Step 6: open() session resolved — native SDK responded:", {
        success: result.success,
        exitedWithError: !result.success && !!result.error,
      });

      if (result.success) {
        try {
          const exchangeResult = await exchangePublicToken(result.publicToken, result.metadata);
          onSuccess?.(exchangeResult.account);
        } catch (err: unknown) {
          const e = err instanceof Error ? err : new Error(String(err));
          console.error("Token exchange error:", e);
          onError?.(e);
          Alert.alert("Error", "Failed to link your bank account. Please try again.");
        }
      } else if (result.error) {
        onError?.(
          new Error(
            result.error.displayMessage ??
              result.error.errorMessage ??
              "Plaid Link error",
          ),
        );
      }
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      console.error("Plaid Link setup error:", e);
      onError?.(e);
      Alert.alert("Error", "Could not connect to banking service. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.white} />
          <Text style={styles.loadingText}>Opening Plaid…</Text>
        </View>
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.brightGreen,
    borderRadius: radii.lg,
    paddingVertical: spacing.md + 2,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  buttonText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.lg,
    color: colors.white,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  loadingText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.md,
    color: colors.white,
  },
});

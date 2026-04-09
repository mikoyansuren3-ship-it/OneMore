import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { fontFamily, fontSize } from "../constants/typography";
import { spacing, radii } from "../constants/spacing";

const AUTH_PRIMARY = "#2E7D32";
const AUTH_PRIMARY_DARK = "#1B5E20";

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !password) {
      setError("Enter email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: err } =
        mode === "signin"
          ? await signIn(trimmed, password)
          : await signUp(trimmed, password);
      if (err) {
        setError(err.message);
        return;
      }
      // AuthGate / Index route to onboarding or tabs.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.logo}>OneMore</Text>
          <Text style={styles.tagline}>Round up. Plant trees.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#9e9e9e"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              editable={!submitting}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9e9e9e"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!submitting}
              onSubmitEditing={onSubmit}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
              onPress={onSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>
                  {mode === "signin" ? "Sign In" : "Sign Up"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchRow}
              onPress={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
              disabled={submitting}
            >
              <Text style={styles.switchText}>
                {mode === "signin"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f7faf6",
  },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  logo: {
    fontFamily: fontFamily.display,
    fontSize: 42,
    color: AUTH_PRIMARY_DARK,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  tagline: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: "#558b2f",
    textAlign: "center",
    marginBottom: spacing.xxl,
  },
  form: {
    width: "100%",
  },
  label: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: AUTH_PRIMARY_DARK,
    marginBottom: spacing.xs,
  },
  input: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#c8e6c9",
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    marginBottom: spacing.md,
    color: "#1b1b1b",
  },
  error: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: "#c0392b",
    marginBottom: spacing.md,
  },
  primaryBtn: {
    backgroundColor: AUTH_PRIMARY,
    borderRadius: radii.lg,
    paddingVertical: spacing.md + 2,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    marginTop: spacing.sm,
  },
  primaryBtnDisabled: { opacity: 0.75 },
  primaryBtnText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.lg,
    color: "#fff",
  },
  switchRow: {
    marginTop: spacing.lg,
    alignItems: "center",
    padding: spacing.sm,
  },
  switchText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: fontSize.sm,
    color: AUTH_PRIMARY,
  },
});

import { useEffect, useRef } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { DMSerifDisplay_400Regular } from "@expo-google-fonts/dm-serif-display";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { colors } from "../constants/colors";
import { isSupabaseConfigured } from "../services/supabase";
import { useRootNavigationReady } from "../hooks/useRootNavigationReady";
import { MAIN_TABS_HREF } from "../constants/routes";

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const {
    loading: authLoading,
    isAuthenticated,
    profileLoading,
    needsOnboarding,
    dbProfile,
  } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const navReady = useRootNavigationReady();
  const segmentPath = segments.join("/");
  const lastReplaceRef = useRef<string | null>(null);

  useEffect(() => {
    if (!navReady) return;
    if (authLoading) return;
    const supabaseOk = isSupabaseConfigured();
    if (isAuthenticated && supabaseOk && profileLoading) return;

    const root = segmentPath.split("/")[0];
    const onboardingDone =
      !supabaseOk || (dbProfile?.onboarding_completed ?? true);

    const target =
      !isAuthenticated && root !== "auth"
        ? "/auth"
        : isAuthenticated && supabaseOk && needsOnboarding && root !== "onboarding"
          ? "/onboarding"
        : isAuthenticated && onboardingDone && root === "auth"
          ? MAIN_TABS_HREF
          : null;

    if (target === null) {
      lastReplaceRef.current = null;
      return;
    }

    if (lastReplaceRef.current === target) return;
    lastReplaceRef.current = target;
    const id = requestAnimationFrame(() => {
      router.replace(target);
    });
    return () => cancelAnimationFrame(id);
  }, [
    navReady,
    authLoading,
    isAuthenticated,
    profileLoading,
    needsOnboarding,
    segmentPath,
    router,
    dbProfile?.onboarding_completed,
  ]);

  return null;
}

function RootLayoutContent() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSerifDisplay_400Regular,
  });
  const { loading: authLoading, isAuthenticated, profileLoading } = useAuth();
  const supabaseOk = isSupabaseConfigured();
  const waitProfile = isAuthenticated && supabaseOk && profileLoading;

  useEffect(() => {
    if (fontsLoaded && !authLoading && !waitProfile) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authLoading, waitProfile]);

  if (!fontsLoaded || authLoading || waitProfile) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.brightGreen} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen
          name="onboarding"
          options={{
            animation: "fade",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="connect-bank"
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="linked-accounts"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="round-ups"
          options={{ presentation: "card", animation: "slide_from_right" }}
        />
      </Stack>
      <AuthGate />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.warmWhite,
    justifyContent: "center",
    alignItems: "center",
  },
});

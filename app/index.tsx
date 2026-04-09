import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { isSupabaseConfigured } from "../services/supabase";

/**
 * Entry `/` — auth, onboarding, or main tabs once session + profile are ready.
 */
export default function Index() {
  const { loading, isAuthenticated, profileLoading, needsOnboarding } = useAuth();
  const router = useRouter();
  const lastTargetRef = useRef<string | null>(null);
  const supabaseOk = isSupabaseConfigured();
  const waitProfile = isAuthenticated && supabaseOk && profileLoading;

  useEffect(() => {
    if (loading || waitProfile) return;
    const target = !isAuthenticated
      ? "/auth"
      : needsOnboarding
        ? "/onboarding"
        : "/(tabs)";
    if (lastTargetRef.current === target) return;
    lastTargetRef.current = target;
    router.replace(target);
  }, [loading, waitProfile, isAuthenticated, needsOnboarding, router]);

  return null;
}

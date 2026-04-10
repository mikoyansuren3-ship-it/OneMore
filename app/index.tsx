import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { isSupabaseConfigured } from "../services/supabase";
import { useRootNavigationReady } from "../hooks/useRootNavigationReady";
import { MAIN_TABS_HREF } from "../constants/routes";

/**
 * Entry `/` — auth, onboarding, or main tabs once session + profile are ready.
 */
export default function Index() {
  const { loading, isAuthenticated, profileLoading, needsOnboarding } = useAuth();
  const router = useRouter();
  const navReady = useRootNavigationReady();
  const lastTargetRef = useRef<string | null>(null);
  const supabaseOk = isSupabaseConfigured();
  const waitProfile = isAuthenticated && supabaseOk && profileLoading;

  useEffect(() => {
    if (!navReady || loading || waitProfile) return;
    const target = !isAuthenticated
      ? "/auth"
      : needsOnboarding
        ? "/onboarding"
        : MAIN_TABS_HREF;
    if (lastTargetRef.current === target) return;
    lastTargetRef.current = target;
    const id = requestAnimationFrame(() => {
      router.replace(target);
    });
    return () => cancelAnimationFrame(id);
  }, [navReady, loading, waitProfile, isAuthenticated, needsOnboarding, router]);

  return null;
}

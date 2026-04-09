import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../services/supabase";
import { ensureProfileRow } from "../services/profile";
import type { DbProfile } from "../types/profile";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** True while loading `profiles` row for the signed-in user (Supabase only). */
  profileLoading: boolean;
  dbProfile: DbProfile | null;
  /** When true, routed to onboarding after auth (new signups). */
  needsOnboarding: boolean;
  refreshDbProfile: () => Promise<void>;
  isAuthenticated: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbProfile, setDbProfile] = useState<DbProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const refreshDbProfile = useCallback(async () => {
    const uid = user?.id;
    if (!uid || !isSupabaseConfigured()) {
      setDbProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    try {
      const row = await ensureProfileRow(uid);
      setDbProfile(row);
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refreshDbProfile();
  }, [refreshDbProfile]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession((prev) => (prev?.access_token === s?.access_token ? prev : s));
      setUser((prev) => {
        const next = s?.user ?? null;
        if (prev?.id === next?.id && prev?.updated_at === next?.updated_at) return prev;
        return next;
      });
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      // TOKEN_REFRESHED and duplicate events often reuse the same access_token; skip setState to avoid re-render loops.
      setSession((prev) => (prev?.access_token === s?.access_token ? prev : s));
      setUser((prev) => {
        const next = s?.user ?? null;
        if (prev?.id === next?.id && prev?.updated_at === next?.updated_at) return prev;
        return next;
      });
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    setDbProfile(null);
    await supabase.auth.signOut();
  }, []);

  const needsOnboarding = Boolean(
    session?.user &&
      isSupabaseConfigured() &&
      dbProfile &&
      !dbProfile.onboarding_completed,
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      loading,
      profileLoading,
      dbProfile,
      needsOnboarding,
      refreshDbProfile,
      isAuthenticated: Boolean(session?.user),
      signUp,
      signIn,
      signOut,
    }),
    [
      session,
      user,
      loading,
      profileLoading,
      dbProfile,
      needsOnboarding,
      refreshDbProfile,
      signUp,
      signIn,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

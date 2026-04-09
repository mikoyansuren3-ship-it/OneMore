import { supabase, isSupabaseConfigured } from "./supabase";
import type { DbProfile } from "../types/profile";
import { parseCauses } from "../types/profile";

function rowToProfile(row: Record<string, unknown>): DbProfile {
  return {
    id: String(row.id),
    first_name: row.first_name != null ? String(row.first_name) : null,
    last_name: row.last_name != null ? String(row.last_name) : null,
    causes: parseCauses(row.causes),
    monthly_tree_goal:
      typeof row.monthly_tree_goal === "number" ? row.monthly_tree_goal : 10,
    onboarding_completed: Boolean(row.onboarding_completed),
    updated_at: row.updated_at != null ? String(row.updated_at) : undefined,
  };
}

export async function fetchProfile(userId: string): Promise<DbProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.warn("[profile] fetchProfile", error.message);
    return null;
  }
  if (!data) return null;
  return rowToProfile(data as Record<string, unknown>);
}

/** Ensures a row exists (e.g. user created before trigger existed). */
export async function ensureProfileRow(userId: string): Promise<DbProfile | null> {
  if (!isSupabaseConfigured()) return null;
  let row = await fetchProfile(userId);
  if (row) return row;
  const { error: insertError } = await supabase.from("profiles").insert({
    id: userId,
    onboarding_completed: false,
  });
  if (insertError) {
    row = await fetchProfile(userId);
    if (row) return row;
    console.warn("[profile] ensureProfileRow insert", insertError.message);
    return null;
  }
  return fetchProfile(userId);
}

export interface OnboardingPayload {
  first_name: string;
  last_name: string | null;
  causes: string[];
  monthly_tree_goal: number;
  onboarding_completed: boolean;
}

export async function saveOnboardingComplete(
  userId: string,
  payload: OnboardingPayload,
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { error: new Error("Supabase is not configured") };
  }
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      first_name: payload.first_name.trim(),
      last_name: payload.last_name?.trim() || null,
      causes: payload.causes,
      monthly_tree_goal: payload.monthly_tree_goal,
      onboarding_completed: payload.onboarding_completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  return { error: error ? new Error(error.message) : null };
}

export async function updateProfileFields(
  userId: string,
  partial: Partial<
    Pick<DbProfile, "first_name" | "last_name" | "causes" | "monthly_tree_goal">
  >,
): Promise<{ error: Error | null }> {
  if (!isSupabaseConfigured()) {
    return { error: new Error("Supabase is not configured") };
  }
  const { error } = await supabase
    .from("profiles")
    .update({
      ...partial,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  return { error: error ? new Error(error.message) : null };
}

/** Row shape for `public.profiles` (Supabase). */
export interface DbProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  causes: string[];
  monthly_tree_goal: number;
  onboarding_completed: boolean;
  updated_at?: string;
}

export const CAUSE_IDS = [
  "trees",
  "ocean",
  "waste",
  "wildlife",
  "climate",
  "water",
] as const;

export type CauseId = (typeof CAUSE_IDS)[number];

export const CAUSE_LABELS: Record<CauseId, { emoji: string; label: string }> = {
  trees: { emoji: "🌳", label: "Planting trees" },
  ocean: { emoji: "🌊", label: "Ocean cleanup" },
  waste: { emoji: "♻️", label: "Reducing waste" },
  wildlife: { emoji: "🐾", label: "Wildlife protection" },
  climate: { emoji: "🌍", label: "Climate action" },
  water: { emoji: "💧", label: "Clean water" },
};

export const TREE_GOAL_OPTIONS = [5, 10, 25, 50, 100] as const;

export function parseCauses(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

export interface Tier {
  name: string;
  icon: string;
  min: number;
  max: number;
  color: string;
}

export const tiers: Tier[] = [
  { name: "Seedling", icon: "🌱", min: 0, max: 10, color: "#7ecc8e" },
  { name: "Sprout", icon: "🌿", min: 10, max: 25, color: "#52b868" },
  { name: "Sapling", icon: "🌳", min: 25, max: 75, color: "#3da35d" },
  { name: "Grove", icon: "🌲", min: 75, max: 200, color: "#2d6b3f" },
  { name: "Canopy", icon: "🏔️", min: 200, max: 500, color: "#c9a84c" },
  { name: "Redwood", icon: "🌎", min: 500, max: Infinity, color: "#c9a84c" },
];

export function getTier(treesPlanted: number): Tier {
  return (
    tiers.find((t) => treesPlanted >= t.min && treesPlanted < t.max) ??
    tiers[tiers.length - 1]
  );
}

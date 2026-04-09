export const colors = {
  forest: "#142a1a",
  deepGreen: "#1e3d24",
  green: "#2d6b3f",
  brightGreen: "#3da35d",
  leaf: "#52b868",
  lightLeaf: "#7ecc8e",

  sage: "#a3c9a8",
  paleGreen: "#d4e8d1",
  cream: "#f0f5ee",
  warmWhite: "#f7faf6",

  gold: "#c9a84c",
  amber: "#d4883e",
  coral: "#e07a5f",
  bark: "#4a3728",
  earth: "#6b5744",

  ocean: "#1a3a4a",
  lightOcean: "#2980b9",

  white: "#ffffff",
  black: "#000000",
  danger: "#c0392b",
  transparent: "transparent",
} as const;

export type ColorName = keyof typeof colors;

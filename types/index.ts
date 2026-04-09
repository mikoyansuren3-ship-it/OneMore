export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  roundup: number;
  time: string;
  isPartner: boolean;
}

export interface UserStats {
  treesPlanted: number;
  plasticRemoved: number;
  co2Offset: number;
  treesThisMonth: number;
  /** Cents accumulated toward the current in-progress tree ($1.00 = 100¢ = 1 tree). */
  nextTreeProgress: number;
  /** Cost of one tree in cents (One Tree Planted: $1 = 1 tree). */
  treeCostCents: number;
  totalDonated: number;
  totalRoundups: number;
  memberSince: string;
}

export interface WeeklySummary {
  donated: number;
  treesPlanted: number;
  percentChange: number;
  streakWeeks: number;
}

export interface RoundUpSettings {
  multiplier: 1 | 2 | 3 | 5;
  threshold: 5 | 10 | 15 | 25;
  paused: boolean;
}

export interface CO2Equivalent {
  icon: string;
  value: string;
  description: string;
  math?: string;
}

export interface UserProfile {
  name: string;
  firstName: string;
  avatar?: string;
  email: string;
  linkedBank: string;
  linkedCardLast4: string;
  referralCode: string;
}

export interface MonthlyImpact {
  month: string;
  shortMonth: string;
  trees: number;
  co2: number;
  donated: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  threshold?: number;
}

export interface PartnerBusiness {
  id: string;
  name: string;
  category: "cafe" | "restaurant" | "grocery" | "gas" | "retail" | "fitness";
  distance: string;
  distanceValue: number;
  address: string;
  isDoubleImpact: boolean;
  latitude: number;
  longitude: number;
  matchCap: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  trees: number;
  isCurrentUser: boolean;
  tier: string;
  tierIcon: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockAt: number;
  unlocked: boolean;
  type: "discount" | "badge" | "streak";
  partner?: string;
}

export interface DonationMonth {
  month: string;
  total: number;
  trees: number;
  roundups: number;
}

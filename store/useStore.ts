import { create } from "zustand";
import {
  Transaction,
  UserStats,
  WeeklySummary,
  RoundUpSettings,
  UserProfile,
  MonthlyImpact,
  Milestone,
  PartnerBusiness,
  LeaderboardEntry,
  Reward,
  DonationMonth,
} from "../types";
import { LinkedAccount, RoundUpTransaction, RoundUpSummary } from "../types/plaid";
import { mockRoundUpSummary } from "../utils/mockPlaidData";

interface AppState {
  profile: UserProfile;
  stats: UserStats;
  weeklySummary: WeeklySummary;
  transactions: Transaction[];
  roundUpSettings: RoundUpSettings;
  monthlyImpact: MonthlyImpact[];
  milestones: Milestone[];
  partners: PartnerBusiness[];
  leaderboard: LeaderboardEntry[];
  rewards: Reward[];
  donationHistory: DonationMonth[];
  linkedAccounts: LinkedAccount[];
  roundUpTransactions: RoundUpTransaction[];
  roundUpSummary: RoundUpSummary;
  isPlaidLinked: boolean;
  setAvatar: (uri: string | undefined) => void;
  setMultiplier: (m: RoundUpSettings["multiplier"]) => void;
  setThreshold: (t: RoundUpSettings["threshold"]) => void;
  togglePause: () => void;
  linkAccount: (account: LinkedAccount) => void;
  unlinkAccount: (accountId: string) => void;
  toggleAccountActive: (accountId: string) => void;
  setPlaidLinked: (linked: boolean) => void;
  setRoundUpTransactions: (txs: RoundUpTransaction[]) => void;
  updateRoundUpSummary: (partial: Partial<RoundUpSummary>) => void;
}

export const useStore = create<AppState>((set) => ({
  profile: {
    name: "Suren",
    firstName: "Suren",
    email: "suren@onemore.earth",
    linkedBank: "",
    linkedCardLast4: "",
    referralCode: "SUREN-GREEN",
  },

  stats: {
    treesPlanted: 47,
    plasticRemoved: 12,
    co2Offset: 1034,
    treesThisMonth: 7,
    nextTreeProgress: 73,
    treeCostCents: 100,
    totalDonated: 55.46,
    totalRoundups: 104,
    memberSince: "Sep 2025",
  },

  weeklySummary: {
    donated: 4.72,
    treesPlanted: 4,
    percentChange: 23,
    streakWeeks: 8,
  },

  transactions: [
    { id: "1", merchant: "Mountain View Café", amount: 5.27, roundup: 0.73, time: "1 hour ago", isPartner: true },
    { id: "2", merchant: "Trader Joe's", amount: 23.47, roundup: 0.53, time: "2 hours ago", isPartner: false },
    { id: "3", merchant: "Shell Gas Station", amount: 45.12, roundup: 0.88, time: "5 hours ago", isPartner: false },
    { id: "4", merchant: "Mendocino Farms", amount: 14.65, roundup: 0.35, time: "Yesterday", isPartner: true },
    { id: "5", merchant: "Target", amount: 67.83, roundup: 0.17, time: "Yesterday", isPartner: false },
    { id: "6", merchant: "Starbucks", amount: 6.45, roundup: 0.55, time: "2 days ago", isPartner: false },
    { id: "7", merchant: "REI Co-op", amount: 89.22, roundup: 0.78, time: "2 days ago", isPartner: false },
    { id: "8", merchant: "Sweetgreen", amount: 13.10, roundup: 0.90, time: "3 days ago", isPartner: true },
  ],

  roundUpSettings: {
    multiplier: 1,
    threshold: 10,
    paused: false,
  },

  monthlyImpact: [
    { month: "2025-10", shortMonth: "Oct", trees: 3, co2: 66, donated: 3.54 },
    { month: "2025-11", shortMonth: "Nov", trees: 5, co2: 110, donated: 5.90 },
    { month: "2025-12", shortMonth: "Dec", trees: 4, co2: 88, donated: 4.72 },
    { month: "2026-01", shortMonth: "Jan", trees: 8, co2: 176, donated: 9.44 },
    { month: "2026-02", shortMonth: "Feb", trees: 10, co2: 220, donated: 11.80 },
    { month: "2026-03", shortMonth: "Mar", trees: 10, co2: 220, donated: 11.80 },
    { month: "2026-04", shortMonth: "Apr", trees: 7, co2: 154, donated: 8.26 },
  ],

  milestones: [
    { id: "m1", title: "First Tree", description: "Planted your first tree", icon: "🌱", earned: true, earnedDate: "Oct 2025" },
    { id: "m2", title: "10 Trees", description: "A mini forest!", icon: "🌿", earned: true, earnedDate: "Dec 2025" },
    { id: "m3", title: "25 Trees", description: "Quarter-century of green", icon: "🌳", earned: true, earnedDate: "Feb 2026" },
    { id: "m4", title: "50 Trees", description: "Half a hundred!", icon: "🌲", earned: false, threshold: 50 },
    { id: "m5", title: "1 Ton CO₂", description: "Offset 1,000 kg of carbon", icon: "☁️", earned: true, earnedDate: "Mar 2026" },
    { id: "m6", title: "100 Round-Ups", description: "Century of spare change", icon: "💰", earned: true, earnedDate: "Mar 2026" },
    { id: "m7", title: "100 Trees", description: "A real grove!", icon: "🏔️", earned: false, threshold: 100 },
    { id: "m8", title: "Ocean Hero", description: "Removed 10 lbs of plastic", icon: "🌊", earned: true, earnedDate: "Mar 2026" },
  ],

  partners: [
    { id: "p1", name: "Mountain View Café", category: "cafe", distance: "0.3 mi", distanceValue: 0.3, address: "142 Castro St, Mountain View, CA", isDoubleImpact: true, latitude: 37.3861, longitude: -122.0839, matchCap: 1.0 },
    { id: "p2", name: "Mendocino Farms", category: "restaurant", distance: "0.7 mi", distanceValue: 0.7, address: "730 Stanford Shopping Ctr, Palo Alto, CA", isDoubleImpact: true, latitude: 37.4430, longitude: -122.1700, matchCap: 1.0 },
    { id: "p3", name: "Sweetgreen", category: "restaurant", distance: "1.2 mi", distanceValue: 1.2, address: "167 University Ave, Palo Alto, CA", isDoubleImpact: true, latitude: 37.4445, longitude: -122.1612, matchCap: 1.0 },
    { id: "p4", name: "Green Earth Grocery", category: "grocery", distance: "1.5 mi", distanceValue: 1.5, address: "2080 Channing Ave, Palo Alto, CA", isDoubleImpact: true, latitude: 37.4260, longitude: -122.1380, matchCap: 0.75 },
    { id: "p5", name: "EcoFit Studio", category: "fitness", distance: "2.1 mi", distanceValue: 2.1, address: "455 El Camino Real, Sunnyvale, CA", isDoubleImpact: false, latitude: 37.3782, longitude: -122.0360, matchCap: 0.50 },
    { id: "p6", name: "Sunrise Shell", category: "gas", distance: "2.4 mi", distanceValue: 2.4, address: "600 San Antonio Rd, Mountain View, CA", isDoubleImpact: false, latitude: 37.4020, longitude: -122.1140, matchCap: 0.50 },
    { id: "p7", name: "The Canopy Shop", category: "retail", distance: "3.0 mi", distanceValue: 3.0, address: "350 University Ave, Palo Alto, CA", isDoubleImpact: true, latitude: 37.4478, longitude: -122.1588, matchCap: 1.0 },
    { id: "p8", name: "Roots & Bloom Café", category: "cafe", distance: "3.8 mi", distanceValue: 3.8, address: "1010 El Camino Real, Menlo Park, CA", isDoubleImpact: true, latitude: 37.4530, longitude: -122.1826, matchCap: 1.0 },
  ],

  leaderboard: [
    { rank: 1, name: "Aria M.", trees: 312, isCurrentUser: false, tier: "Canopy", tierIcon: "🏔️" },
    { rank: 2, name: "Jake T.", trees: 248, isCurrentUser: false, tier: "Canopy", tierIcon: "🏔️" },
    { rank: 3, name: "Maya L.", trees: 195, isCurrentUser: false, tier: "Grove", tierIcon: "🌲" },
    { rank: 4, name: "Kai R.", trees: 162, isCurrentUser: false, tier: "Grove", tierIcon: "🌲" },
    { rank: 5, name: "Nadia S.", trees: 134, isCurrentUser: false, tier: "Grove", tierIcon: "🌲" },
    { rank: 6, name: "Liam P.", trees: 98, isCurrentUser: false, tier: "Grove", tierIcon: "🌲" },
    { rank: 7, name: "Zoe K.", trees: 85, isCurrentUser: false, tier: "Grove", tierIcon: "🌲" },
    { rank: 8, name: "Ethan W.", trees: 72, isCurrentUser: false, tier: "Sapling", tierIcon: "🌳" },
    { rank: 9, name: "Priya D.", trees: 63, isCurrentUser: false, tier: "Sapling", tierIcon: "🌳" },
    { rank: 10, name: "Suren", trees: 47, isCurrentUser: true, tier: "Sapling", tierIcon: "🌳" },
    { rank: 11, name: "Oliver N.", trees: 41, isCurrentUser: false, tier: "Sapling", tierIcon: "🌳" },
    { rank: 12, name: "Mia C.", trees: 35, isCurrentUser: false, tier: "Sapling", tierIcon: "🌳" },
  ],

  rewards: [
    { id: "r1", title: "10% off Mendocino Farms", description: "Any order over $10", icon: "🥗", unlockAt: 25, unlocked: true, type: "discount", partner: "Mendocino Farms" },
    { id: "r2", title: "Free coffee at Mountain View Café", description: "Any drink, any size", icon: "☕", unlockAt: 50, unlocked: false, type: "discount", partner: "Mountain View Café" },
    { id: "r3", title: "Seedling Badge", description: "Planted your first 10 trees", icon: "🌱", unlockAt: 10, unlocked: true, type: "badge" },
    { id: "r4", title: "Sapling Badge", description: "Planted 25 trees", icon: "🌳", unlockAt: 25, unlocked: true, type: "badge" },
    { id: "r5", title: "Grove Badge", description: "Plant 75 trees to unlock", icon: "🌲", unlockAt: 75, unlocked: false, type: "badge" },
    { id: "r6", title: "4-Week Streak", description: "Round up for 4 consecutive weeks", icon: "🔥", unlockAt: 4, unlocked: true, type: "streak" },
    { id: "r7", title: "8-Week Streak", description: "Round up for 8 consecutive weeks", icon: "💥", unlockAt: 8, unlocked: true, type: "streak" },
    { id: "r8", title: "15% off The Canopy Shop", description: "Any purchase over $25", icon: "🛍️", unlockAt: 75, unlocked: false, type: "discount", partner: "The Canopy Shop" },
  ],

  donationHistory: [
    { month: "March 2026", total: 11.80, trees: 10, roundups: 22 },
    { month: "February 2026", total: 11.80, trees: 10, roundups: 20 },
    { month: "January 2026", total: 9.44, trees: 8, roundups: 18 },
    { month: "December 2025", total: 4.72, trees: 4, roundups: 12 },
    { month: "November 2025", total: 5.90, trees: 5, roundups: 14 },
    { month: "October 2025", total: 3.54, trees: 3, roundups: 8 },
  ],

  linkedAccounts: [],
  roundUpTransactions: [],
  roundUpSummary: { ...mockRoundUpSummary },
  isPlaidLinked: false,

  setAvatar: (uri) =>
    set((s) => ({ profile: { ...s.profile, avatar: uri } })),
  setMultiplier: (m) =>
    set((s) => ({ roundUpSettings: { ...s.roundUpSettings, multiplier: m } })),
  setThreshold: (t) =>
    set((s) => ({ roundUpSettings: { ...s.roundUpSettings, threshold: t } })),
  togglePause: () =>
    set((s) => ({
      roundUpSettings: {
        ...s.roundUpSettings,
        paused: !s.roundUpSettings.paused,
      },
    })),

  // TODO: Replace with real Plaid API: exchange public_token, persist accounts server-side
  linkAccount: (account) =>
    set((s) => {
      const exists = s.linkedAccounts.some((a) => a.id === account.id);
      const linkedAccounts = exists
        ? s.linkedAccounts.map((a) => (a.id === account.id ? account : a))
        : [...s.linkedAccounts, account];
      const primary = linkedAccounts.find((a) => a.isActive) ?? linkedAccounts[0];
      return {
        linkedAccounts,
        isPlaidLinked: linkedAccounts.length > 0,
        profile: primary
          ? {
              ...s.profile,
              linkedBank: `${primary.institutionName} ${primary.accountType === "checking" ? "Checking" : primary.accountType === "savings" ? "Savings" : "Credit"}`,
              linkedCardLast4: primary.accountMask,
            }
          : s.profile,
      };
    }),

  // TODO: Replace with real Plaid API: remove item / revoke access
  unlinkAccount: (accountId) =>
    set((s) => {
      const linkedAccounts = s.linkedAccounts.filter((a) => a.id !== accountId);
      const primary = linkedAccounts.find((a) => a.isActive) ?? linkedAccounts[0];
      return {
        linkedAccounts,
        isPlaidLinked: linkedAccounts.length > 0,
        roundUpTransactions: linkedAccounts.length === 0 ? [] : s.roundUpTransactions,
        profile:
          linkedAccounts.length === 0
            ? { ...s.profile, linkedBank: "", linkedCardLast4: "" }
            : primary
              ? {
                  ...s.profile,
                  linkedBank: `${primary.institutionName} ${primary.accountType === "checking" ? "Checking" : primary.accountType === "savings" ? "Savings" : "Credit"}`,
                  linkedCardLast4: primary.accountMask,
                }
              : s.profile,
      };
    }),

  toggleAccountActive: (accountId) =>
    set((s) => {
      const linkedAccounts = s.linkedAccounts.map((a) =>
        a.id === accountId ? { ...a, isActive: !a.isActive } : a
      );
      const primary = linkedAccounts.find((a) => a.isActive) ?? linkedAccounts[0];
      return {
        linkedAccounts,
        profile: primary
          ? {
              ...s.profile,
              linkedBank: `${primary.institutionName} ${primary.accountType === "checking" ? "Checking" : primary.accountType === "savings" ? "Savings" : "Credit"}`,
              linkedCardLast4: primary.accountMask,
            }
          : s.profile,
      };
    }),

  setPlaidLinked: (linked) => set({ isPlaidLinked: linked }),

  setRoundUpTransactions: (txs) => set({ roundUpTransactions: txs }),

  updateRoundUpSummary: (partial) =>
    set((s) => ({
      roundUpSummary: { ...s.roundUpSummary, ...partial },
    })),
}));

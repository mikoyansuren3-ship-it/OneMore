import { LinkedAccount, RoundUpTransaction, RoundUpSummary } from "../types/plaid";

/** Match spec: ceil(original) - original, or $1.00 if purchase is a whole dollar amount */
export function computeRoundUp(originalAmount: number): number {
  const isWhole = Math.abs(originalAmount - Math.round(originalAmount)) < 1e-6;
  if (isWhole) return 1.0;
  const next = Math.ceil(originalAmount * 100) / 100;
  return Math.round((next - originalAmount) * 100) / 100;
}

export const mockLinkedAccounts: LinkedAccount[] = [
  {
    id: "acc_1",
    institutionName: "Chase",
    institutionLogo: "🏦",
    accountName: "Total Checking",
    accountMask: "4832",
    accountType: "checking",
    isActive: true,
    linkedAt: "2026-03-15T10:30:00Z",
  },
  {
    id: "acc_2",
    institutionName: "Bank of America",
    institutionLogo: "🏦",
    accountName: "Advantage Savings",
    accountMask: "7291",
    accountType: "savings",
    isActive: false,
    linkedAt: "2026-03-20T14:15:00Z",
  },
];

export const mockTransactions: RoundUpTransaction[] = [
  { id: "tx_1", merchantName: "Starbucks", merchantCategory: "Food & Drink", originalAmount: 4.37, roundUpAmount: computeRoundUp(4.37), date: "2026-04-06T09:15:00Z", accountMask: "4832" },
  { id: "tx_2", merchantName: "Shell Gas", merchantCategory: "Gas", originalAmount: 42.18, roundUpAmount: computeRoundUp(42.18), date: "2026-04-06T07:40:00Z", accountMask: "4832" },
  { id: "tx_3", merchantName: "Trader Joe's", merchantCategory: "Groceries", originalAmount: 23.47, roundUpAmount: computeRoundUp(23.47), date: "2026-04-05T18:22:00Z", accountMask: "4832" },
  { id: "tx_4", merchantName: "Amazon", merchantCategory: "Shopping", originalAmount: 31.0, roundUpAmount: computeRoundUp(31.0), date: "2026-04-05T11:05:00Z", accountMask: "4832" },
  { id: "tx_5", merchantName: "Uber", merchantCategory: "Transport", originalAmount: 18.64, roundUpAmount: computeRoundUp(18.64), date: "2026-04-04T22:10:00Z", accountMask: "4832" },
  { id: "tx_6", merchantName: "Chipotle", merchantCategory: "Food & Drink", originalAmount: 12.89, roundUpAmount: computeRoundUp(12.89), date: "2026-04-04T12:30:00Z", accountMask: "4832" },
  { id: "tx_7", merchantName: "Target", merchantCategory: "Shopping", originalAmount: 67.83, roundUpAmount: computeRoundUp(67.83), date: "2026-04-03T16:45:00Z", accountMask: "4832" },
  { id: "tx_8", merchantName: "Netflix", merchantCategory: "Entertainment", originalAmount: 15.99, roundUpAmount: computeRoundUp(15.99), date: "2026-04-02T08:00:00Z", accountMask: "4832" },
  { id: "tx_9", merchantName: "Spotify", merchantCategory: "Entertainment", originalAmount: 10.99, roundUpAmount: computeRoundUp(10.99), date: "2026-04-01T10:00:00Z", accountMask: "4832" },
  { id: "tx_10", merchantName: "Whole Foods", merchantCategory: "Groceries", originalAmount: 54.12, roundUpAmount: computeRoundUp(54.12), date: "2026-03-31T19:20:00Z", accountMask: "4832" },
  { id: "tx_11", merchantName: "Sweetgreen", merchantCategory: "Food & Drink", originalAmount: 13.1, roundUpAmount: computeRoundUp(13.1), date: "2026-03-30T13:15:00Z", accountMask: "4832" },
  { id: "tx_12", merchantName: "CVS Pharmacy", merchantCategory: "Shopping", originalAmount: 8.45, roundUpAmount: computeRoundUp(8.45), date: "2026-03-29T09:50:00Z", accountMask: "4832" },
  { id: "tx_13", merchantName: "Lyft", merchantCategory: "Transport", originalAmount: 22.0, roundUpAmount: computeRoundUp(22.0), date: "2026-03-28T21:05:00Z", accountMask: "4832" },
  { id: "tx_14", merchantName: "REI Co-op", merchantCategory: "Shopping", originalAmount: 89.22, roundUpAmount: computeRoundUp(89.22), date: "2026-03-27T14:00:00Z", accountMask: "4832" },
  { id: "tx_15", merchantName: "Peet's Coffee", merchantCategory: "Food & Drink", originalAmount: 5.25, roundUpAmount: computeRoundUp(5.25), date: "2026-03-26T08:40:00Z", accountMask: "4832" },
  { id: "tx_16", merchantName: "Safeway", merchantCategory: "Groceries", originalAmount: 76.33, roundUpAmount: computeRoundUp(76.33), date: "2026-03-25T17:30:00Z", accountMask: "4832" },
  { id: "tx_17", merchantName: "Muni Mobile", merchantCategory: "Transport", originalAmount: 3.0, roundUpAmount: computeRoundUp(3.0), date: "2026-03-24T07:15:00Z", accountMask: "4832" },
  { id: "tx_18", merchantName: "Apple Store", merchantCategory: "Shopping", originalAmount: 49.99, roundUpAmount: computeRoundUp(49.99), date: "2026-03-24T12:00:00Z", accountMask: "4832" },
];

export const mockRoundUpSummary: RoundUpSummary = {
  totalRoundUps: 47.83,
  thisMonthRoundUps: 12.56,
  thisWeekRoundUps: 4.23,
  pendingDonation: 3.56,
  donationThreshold: 5.0,
  totalDonated: 44.27,
  treesPlanted: 44,
  plasticRemoved: 22.1,
};

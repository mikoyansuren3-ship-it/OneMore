export interface LinkedAccount {
  id: string;
  institutionName: string;
  institutionLogo: string;
  accountName: string;
  accountMask: string;
  accountType: "checking" | "savings" | "credit";
  isActive: boolean;
  linkedAt: string;
}

export interface RoundUpTransaction {
  id: string;
  merchantName: string;
  merchantCategory: string;
  originalAmount: number;
  roundUpAmount: number;
  date: string;
  accountMask: string;
}

export interface RoundUpSummary {
  totalRoundUps: number;
  thisMonthRoundUps: number;
  thisWeekRoundUps: number;
  pendingDonation: number;
  donationThreshold: number;
  totalDonated: number;
  treesPlanted: number;
  plasticRemoved: number;
}

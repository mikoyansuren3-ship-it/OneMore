import { LinkedAccount } from "../types/plaid";
import type { ExchangeAccountPayload } from "../services/plaid";

function mapAccountType(plaidType?: string | null): LinkedAccount["accountType"] {
  const t = (plaidType ?? "").toLowerCase();
  if (t === "credit") return "credit";
  if (t === "loan") return "credit";
  if (t === "savings" || t === "depository") return "checking";
  return "checking";
}

export function exchangePayloadToLinkedAccount(
  account: ExchangeAccountPayload,
): LinkedAccount {
  const mask = account.account_mask ?? "0000";
  return {
    id: `plaid_${Date.now()}`,
    institutionName: account.institution_name ?? "Linked bank",
    institutionLogo: "🏦",
    accountName: account.account_name ?? "Account",
    accountMask: mask,
    accountType: mapAccountType(account.account_type),
    isActive: true,
    linkedAt: new Date().toISOString(),
  };
}

import { RoundUpTransaction } from "../types/plaid";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function sectionLabelForDate(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const t0 = startOfDay(now);
  const t1 = startOfDay(d);
  const dayMs = 86400000;
  if (t1 === t0) return "Today";
  if (t1 === t0 - dayMs) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export interface TransactionSection {
  title: string;
  data: RoundUpTransaction[];
}

export function groupTransactionsByDay(
  txs: RoundUpTransaction[],
  now: Date = new Date()
): TransactionSection[] {
  const sorted = [...txs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const map = new Map<string, RoundUpTransaction[]>();
  for (const tx of sorted) {
    const key = String(startOfDay(new Date(tx.date)));
    const list = map.get(key) ?? [];
    list.push(tx);
    map.set(key, list);
  }
  const keys = [...map.keys()].sort((a, b) => Number(b) - Number(a));
  const sections: TransactionSection[] = [];
  for (const key of keys) {
    const data = map.get(key);
    if (!data?.length) continue;
    const title = sectionLabelForDate(data[0].date, now);
    sections.push({ title, data });
  }
  return sections;
}

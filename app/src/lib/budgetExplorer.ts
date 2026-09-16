import type { FlatRow } from "./types.ts";

export type BudgetMetric = "izvrsenje2025" | "tekuciPlan2025" | "izvrsenje2024";

export const BUDGET_METRICS: { key: BudgetMetric; label: string; short: string }[] = [
  { key: "izvrsenje2025", label: "Izvršenje 2025.", short: "Izvršeno 2025." },
  { key: "tekuciPlan2025", label: "Tekući plan 2025.", short: "Planirano 2025." },
  { key: "izvrsenje2024", label: "Izvršenje 2024.", short: "Izvršeno 2024." },
];

// Stable colours by function, independent of the ranking or selected year.
const FUNCTION_COLOURS: Record<string, string> = {
  "01": "#34536e", "02": "#637584", "03": "#a44769", "04": "#a66a24",
  "05": "#3d7e48", "06": "#74802d", "07": "#128374", "08": "#8060ad",
  "09": "#2579b8", "10": "#c45765",
};

export function functionColour(code: string | null): string {
  return FUNCTION_COLOURS[code?.slice(0, 2) ?? ""] ?? "#475569";
}

export function functionLabel(row: FlatRow): string {
  const name = row.opis.toLocaleLowerCase("hr-HR");
  return name.charAt(0).toLocaleUpperCase("hr-HR") + name.slice(1);
}

export function metricValue(row: FlatRow, metric: BudgetMetric): number {
  const value = row[metric];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function budgetFunctions(rows: FlatRow[]): FlatRow[] {
  return rows.filter((row) => row.razina === 2 && /^\d{2}$/.test(row.kod ?? ""));
}

export function functionChildren(rows: FlatRow[], code: string): FlatRow[] {
  return rows.filter((row) => row.razina === 3 && row.kod?.startsWith(code));
}

export function sumMetric(rows: FlatRow[], metric: BudgetMetric): number {
  return rows.reduce((total, row) => total + metricValue(row, metric), 0);
}

export function ratioPercent(value: number, base: number): number | null {
  return base > 0 ? (value / base) * 100 : null;
}

export function readBudgetMetric(value: string | null): BudgetMetric {
  return BUDGET_METRICS.find((metric) => metric.key === value)?.key ?? "izvrsenje2025";
}

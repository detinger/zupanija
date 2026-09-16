const eur = new Intl.NumberFormat("hr-HR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const eurCents = new Intl.NumberFormat("hr-HR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const num = new Intl.NumberFormat("hr-HR", { maximumFractionDigits: 0 });

export function fmtEur(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return eur.format(v);
}

export function fmtEurExact(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return eurCents.format(v);
}

export function fmtNum(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return num.format(v);
}

export function fmtPct(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${num.format(v)}%`;
}

export function fmtEurCompact(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toLocaleString("hr-HR", { maximumFractionDigits: 1 })} mil. €`;
  if (abs >= 1_000) return `${(v / 1_000).toLocaleString("hr-HR", { maximumFractionDigits: 0 })} tis. €`;
  return fmtEur(v);
}

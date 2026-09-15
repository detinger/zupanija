import type { LucideIcon } from "lucide-react";
export function KpiCard({ label, value, sub, accent = "blue", icon: Icon }: {
  label: string; value: string; sub?: string; accent?: "blue" | "green" | "gold" | "slate"; icon?: LucideIcon;
}) {
  return <div className={`kpi-card kpi-${accent}`}><div className="kpi-label"><span>{label}</span>{Icon && <Icon size={18} aria-hidden="true" />}</div><p className="kpi-value" title={value}>{value}</p>{sub && <p className="kpi-sub">{sub}</p>}</div>;
}

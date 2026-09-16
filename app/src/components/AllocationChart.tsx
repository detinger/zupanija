import { arc, pie } from "d3";
import { useId } from "react";
import type { FlatRow } from "../lib/types";
import { functionColour, functionLabel, metricValue, sumMetric, type BudgetMetric } from "../lib/budgetExplorer";
import { fmtEurCompact, fmtEurExact } from "../lib/format";

export function AllocationChart({ rows, metric = "izvrsenje2025", selected, onSelect, mode = "ring" }: {
  rows: FlatRow[]; metric?: BudgetMetric; selected?: string | null; onSelect: (code: string) => void; mode?: "ring" | "hundred";
}) {
  const id = useId();
  const total = sumMetric(rows, metric);
  const active = rows.find(row => row.kod === selected);
  const slices = pie<FlatRow>().value(row => Math.max(0, metricValue(row, metric))).sort(null)(rows);
  const path = arc<(typeof slices)[number]>().innerRadius(123).outerRadius(177).cornerRadius(5).padAngle(.018);
  const selectedShare = active && total > 0 ? metricValue(active, metric) / total * 100 : null;
  // Largest-remainder rounding keeps the illustrative grid at exactly 100 cells.
  const shares = rows.map(row => ({ row, exact: total > 0 ? Math.max(0, metricValue(row, metric)) / total * 100 : 0, count: 0 }));
  shares.forEach(item => { item.count = Math.floor(item.exact); });
  const remainder = Math.max(0, 100 - shares.reduce((sum, item) => sum + item.count, 0));
  [...shares].sort((a, b) => (b.exact - b.count) - (a.exact - a.count)).slice(0, total > 0 ? remainder : 0).forEach(item => item.count++);
  const cells = shares.flatMap(item => Array.from({ length: item.count }, () => item.row));
  return <div className={`allocation-chart allocation-chart--${mode}`}>
    {mode === "ring" ? <div className="allocation-ring">
      <svg viewBox="0 0 400 400" role="img" aria-labelledby={`${id}-title`}>
        <title id={`${id}-title`}>Raspodjela rashoda po funkcijama. Kategorije možete odabrati u popisu uz graf.</title>
        <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" strokeOpacity=".1" strokeDasharray="1 7" />
        <g transform="translate(200,200)">{slices.map(slice => <path key={slice.data.kod} d={path(slice) ?? undefined} fill={functionColour(slice.data.kod)}
          className="allocation-slice" data-muted={Boolean(active && active.kod !== slice.data.kod)} data-active={active?.kod === slice.data.kod}
          onClick={() => onSelect(slice.data.kod!)}><title>{functionLabel(slice.data)}: {fmtEurExact(metricValue(slice.data, metric))}</title></path>)}</g>
      </svg>
      <div className="allocation-center" aria-live="polite"><span>{active ? functionLabel(active) : "Ukupni rashodi"}</span><strong>{active ? (selectedShare !== null && selectedShare > 0 && selectedShare < .1 ? "< 0,1 %" : `${selectedShare?.toLocaleString("hr-HR", { maximumFractionDigits: 1 }) ?? "—"} %`) : fmtEurCompact(total)}</strong><small>{active ? fmtEurCompact(metricValue(active, metric)) : "Istarska županija · 2025."}</small></div>
    </div> : <div className="hundred-chart"><div className="hundred-grid" aria-hidden="true">{cells.map((row, index) => <span key={index} style={{ background: functionColour(row.kod), opacity: active && active.kod !== row.kod ? .15 : 1 }} />)}</div><p>Jedno polje ≈ 1 € od 100 € rashoda. Udjeli su zaokruženi; točni iznosi nalaze se u popisu.</p></div>}
  </div>;
}

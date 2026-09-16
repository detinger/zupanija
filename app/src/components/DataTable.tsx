import { useMemo, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Download } from "lucide-react";
import { fmtEur, fmtPct } from "../lib/format";
import { downloadCsv } from "../lib/exportView";
import type { FlatRow } from "../lib/types";

type SortKey = "opis" | "tekuciPlan2025" | "izvrsenje2025" | "indeks43";

export function DataTable({
  rows,
  maxLevel = 99,
  onSelect,
  selectedKod,
  exportName = "tablica",
  title,
}: {
  rows: FlatRow[];
  maxLevel?: number;
  onSelect?: (row: FlatRow) => void;
  selectedKod?: string | null;
  exportName?: string;
  title?: string;
}) {
  const [onlyTop, setOnlyTop] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null);
  const minLevel = rows.length ? Math.min(...rows.map((r) => r.razina)) : 0;
  const mainLevel = Math.min(...rows.filter((r) => r.kod).map((r) => r.razina), maxLevel);

  const visible = useMemo(() => {
    const base = rows.filter((r) => r.razina <= (onlyTop ? mainLevel : maxLevel));
    if (!sort) return base;
    return [...base].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string" || typeof bv === "string") {
        return String(av).localeCompare(String(bv), "hr") * sort.dir;
      }
      return ((av as number) - (bv as number)) * sort.dir;
    });
  }, [rows, onlyTop, maxLevel, mainLevel, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) => (s?.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: -1 }));
  }

  function sortIcon(col: SortKey) {
    if (sort?.key !== col) return <ArrowUpDown size={11} className="text-slate-300" />;
    return sort.dir === 1 ? <ArrowUp size={11} className="text-iz-blue-600" /> : <ArrowDown size={11} className="text-iz-blue-600" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2.5">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <input type="checkbox" checked={onlyTop} onChange={(e) => setOnlyTop(e.target.checked)} className="accent-iz-blue-600" />
          Prikaži samo glavne stavke
        </label>
        <button
          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-500 transition hover:border-iz-blue-300 hover:bg-iz-blue-50 hover:text-iz-blue-700"
          onClick={() =>
            downloadCsv(
              `${exportName}.csv`,
              visible.map((r) => ({
                sifra: r.kod ?? "",
                naziv: r.opis,
                "izvorni plan 2025": r.izvorniPlan2025,
                "tekući plan 2025": r.tekuciPlan2025,
                "izvršenje 2025": r.izvrsenje2025,
                "izvršenje 2024": r.izvrsenje2024,
                "% plana": r.indeks43,
              }))
            )
          }
        >
          <Download size={12} /> Preuzmi prikazano (CSV)
        </button>
      </div>
      {title && <p className="px-4 pt-3 text-sm font-semibold text-slate-700">{title}</p>}
      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <Th onClick={() => toggleSort("opis")}>
                Naziv {sortIcon("opis")}
              </Th>
              <Th align="right" onClick={() => toggleSort("tekuciPlan2025")}>
                Tekući plan 2025. {sortIcon("tekuciPlan2025")}
              </Th>
              <Th align="right" onClick={() => toggleSort("izvrsenje2025")}>
                Izvršenje 2025. {sortIcon("izvrsenje2025")}
              </Th>
              <Th align="right" onClick={() => toggleSort("indeks43")}>
                % plana {sortIcon("indeks43")}
              </Th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr
                key={`${r.kod}-${i}`}
                onClick={() => onSelect?.(r)}
                tabIndex={onSelect ? 0 : undefined}
                onKeyDown={e => { if (onSelect && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onSelect(r); } }}
                className={`border-t border-slate-100 ${onSelect ? "cursor-pointer hover:bg-iz-blue-50/60" : ""} transition-colors ${
                  selectedKod != null && selectedKod === r.kod ? "bg-iz-blue-50" : ""
                }`}
              >
                <td className="px-4 py-1.5" style={{ paddingLeft: 16 + (r.razina - minLevel) * 16 }}>
                  <span className={r.razina <= minLevel ? "font-semibold text-slate-800" : "text-slate-600"}>
                    {r.kod && <span className="tabular mr-1.5 text-slate-400">{r.kod}</span>}
                    {r.opis}
                  </span>
                </td>
                <td className="tabular px-3 py-1.5 text-right text-slate-500">{fmtEur(r.tekuciPlan2025)}</td>
                <td className="tabular px-3 py-1.5 text-right font-medium text-slate-800">
                  {fmtEur(r.izvrsenje2025)}
                </td>
                <td className="tabular px-3 py-1.5 text-right text-slate-500">{fmtPct(r.indeks43)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  align = "left",
  onClick,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  onClick?: () => void;
}) {
  return (
    <th
      className={`select-none px-3 py-2 font-medium first:px-4 ${align === "right" ? "text-right" : "text-left"} ${
        onClick ? "cursor-pointer hover:text-iz-blue-600" : ""
      }`}
    >
      <button type="button" onClick={onClick} className={`inline-flex items-center gap-1 ${align === "right" ? "flex-row-reverse" : ""}`}>{children}</button>
    </th>
  );
}

import { useId, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { color } from "d3";
import type { FlatRow } from "../lib/types";
import { functionColour, functionLabel, metricValue, sumMetric } from "../lib/budgetExplorer";
import { fmtEurCompact, fmtEurExact } from "../lib/format";

const percent = (value: number) => value > 0 && value < .1 ? "< 0,1 %" : `${value.toLocaleString("hr-HR", { maximumFractionDigits: 1 })} %`;
// The same category hues, lifted for the dark canvas.
const ink = (code: string | null) => color(functionColour(code))?.brighter(.85).formatHex() ?? functionColour(code);

export function KineticAllocation({ rows, mode, selected, onSelect }: {
  rows: FlatRow[];
  mode: "orbit" | "grid";
  selected?: string;
  onSelect: (code?: string) => void;
}) {
  const id = useId();
  const reduced = useReducedMotion();
  const total = sumMetric(rows, "izvrsenje2025");
  const active = rows.find(row => row.kod === selected);
  const cells = useMemo(() => {
    const shares = rows.map(row => {
      const exact = total > 0 ? Math.max(0, metricValue(row, "izvrsenje2025")) / total * 100 : 0;
      return { row, exact, count: Math.floor(exact) };
    });
    const remaining = total > 0 ? Math.max(0, 100 - shares.reduce((sum, item) => sum + item.count, 0)) : 0;
    [...shares].sort((a, b) => (b.exact - b.count) - (a.exact - a.count)).slice(0, remaining).forEach(item => item.count++);
    return shares.flatMap(item => Array.from({ length: item.count }, (_, i) => ({ row: item.row, id: `${item.row.kod}-${i}` })));
  }, [rows, total]);
  const share = active && total > 0 ? metricValue(active, "izvrsenje2025") / total * 100 : 100;

  return <div className="kinetic-allocation">
    <div className="kinetic-canvas">
      <svg viewBox="0 0 480 440" role="img" aria-labelledby={`${id}-title ${id}-description`}>
        <title id={`${id}-title`}>Raspodjela svakih 100 € rashoda po namjenama</title>
        <desc id={`${id}-description`}>Svako polje predstavlja približno jedan euro. Udjeli su zaokruženi. Sve namjene i točni udjeli dostupni su u popisu ispod grafa.</desc>
        <g className="kinetic-guides" aria-hidden="true">
          <circle cx="240" cy="220" r="201" />
          <circle cx="240" cy="220" r="122" />
          <path d="M 240 5 V 24 M 240 416 V 435 M 20 220 H 39 M 441 220 H 460" />
        </g>
        {cells.map(({ row, id: cellId }, index) => {
          const angle = (Math.floor(index / 2) / 50) * Math.PI * 2 - Math.PI / 2;
          const radius = index % 2 === 0 ? 153 : 179;
          const orbit = { x: 240 + Math.cos(angle) * radius - 9, y: 220 + Math.sin(angle) * radius - 9, rotate: angle * 180 / Math.PI + 90 };
          const grid = { x: 99 + (index % 10) * 29, y: 79 + Math.floor(index / 10) * 29, rotate: 0 };
          const muted = Boolean(active && active.kod !== row.kod);
          return <motion.rect key={cellId} width={18} height={18} rx={3}
            initial={reduced ? false : { ...orbit, opacity: 0, scale: .35 }}
            animate={{ ...(mode === "grid" ? grid : orbit), opacity: muted ? .17 : 1, scale: mode === "grid" ? 1.2 : 1 }}
            whileHover={reduced ? undefined : { scale: 1.45 }}
            transition={{ duration: reduced ? 0 : .85, ease: [.22, 1, .36, 1], delay: reduced ? 0 : index * .0025 }}
            fill={ink(row.kod)} className="kinetic-cell" onClick={() => onSelect(active?.kod === row.kod ? undefined : row.kod!)}>
            <title>{functionLabel(row)}: {fmtEurExact(metricValue(row, "izvrsenje2025"))}</title>
          </motion.rect>;
        })}
      </svg>
      <AnimatePresence>
        {mode === "orbit" && <motion.div className="kinetic-center" key="center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .2 }}>
          <span>{active ? "OD SVAKIH 100 €" : "ZAJEDNIČKI PRORAČUN"}</span>
          <strong>{active ? share > 0 && share < .1 ? "< 0,1 €" : `${share.toLocaleString("hr-HR", { maximumFractionDigits: 1 })} €` : "100 €"}</strong>
          <small>{active ? functionLabel(active) : "Deset namjena. Jedna cjelina."}</small>
        </motion.div>}
      </AnimatePresence>
      <div className="kinetic-axis-label" aria-hidden="true">{mode === "orbit" ? "RASPODJELA RASHODA" : "10 × 10 · SVAKIH 100 €"}</div>
    </div>
    <div className="kinetic-legend" role="group" aria-label="Odaberite namjenu rashoda">
      {rows.map(row => <button key={row.kod} aria-pressed={active?.kod === row.kod}
        onClick={() => onSelect(active?.kod === row.kod ? undefined : row.kod!)}>
        <i style={{ background: ink(row.kod) }} />
        <span>{functionLabel(row)}</span>
        <strong>{percent(total > 0 ? metricValue(row, "izvrsenje2025") / total * 100 : 0)}</strong>
      </button>)}
    </div>
    <div className="kinetic-selection" aria-live="polite">
      <div><span>{active ? functionLabel(active) : "Ukupni rashodi · izvršenje 2025."}</span><strong>{fmtEurCompact(active ? metricValue(active, "izvrsenje2025") : total)}</strong></div>
      {active ? <button aria-label="Prikaži sve namjene" onClick={() => onSelect()}><RotateCcw size={16} /></button> : <Link to="/rashodi" aria-label="Otvori detaljan pregled rashoda"><ArrowUpRight size={20} /></Link>}
    </div>
    <p className="kinetic-footnote">Jedno polje ≈ 1 €. Zaokružena ilustracija; popis prikazuje točne udjele.</p>
  </div>;
}

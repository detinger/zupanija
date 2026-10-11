import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { fmtEurCompact, fmtEurExact, fmtPct } from "../lib/format";

const ease = [.22, 1, .36, 1] as const;

export function PlanFigure({ rows }: { rows: { label: string; actual: number; plan: number }[] }) {
  const reduced = useReducedMotion();
  const max = Math.max(1, ...rows.flatMap(row => [row.plan, row.actual]));
  return <div className="plan-figure">
    <div className="figure-legend"><span><i />Tekući plan</span><span><i />Izvršenje</span></div>
    {rows.map((row, index) => <div className="plan-figure-row" key={row.label}>
      <div className="plan-figure-label"><span><small>0{index + 1}</small>{row.label}</span><strong>{fmtEurCompact(row.actual)}</strong></div>
      <div className="plan-figure-track" aria-hidden="true">
        <div className="plan-figure-plan" style={{ width: `${row.plan / max * 100}%` }} />
        <motion.div className="plan-figure-actual" style={{ width: `${row.actual / max * 100}%` }}
          initial={{ scaleX: reduced ? 1 : 0 }} animate={{ scaleX: 1 }} transition={{ duration: reduced ? 0 : 1.1, delay: reduced ? 0 : index * .14, ease }} />
      </div>
      <div className="plan-figure-meta"><span>Plan {fmtEurCompact(row.plan)}</span><strong>{fmtPct(row.plan > 0 ? row.actual / row.plan * 100 : null)} ostvareno</strong></div>
      <p className="plan-figure-difference">{row.actual < row.plan ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}{fmtEurCompact(Math.abs(row.actual - row.plan))} {row.actual < row.plan ? "ispod" : "iznad"} tekućeg plana</p>
    </div>)}
    <p className="figure-caption">Duljina trake pokazuje iznos. Obje usporedbe koriste istu skalu.</p>
  </div>;
}

export function InvestmentFigure({ previous, actual, plan }: { previous: number; actual: number; plan: number }) {
  const reduced = useReducedMotion();
  const max = Math.max(previous, actual, 1);
  const change = previous > 0 ? (actual / previous - 1) * 100 : null;
  return <div className="investment-figure">
    <div className="investment-change"><span>PROMJENA U ODNOSU NA 2024.</span><strong>{change === null ? "—" : `${change >= 0 ? "+" : ""}${fmtPct(change)}`}</strong></div>
    <div className="investment-plot">
      <div className="investment-guides" aria-hidden="true"><i /><i /><i /><i /></div>
      {[{ year: "2024.", value: previous }, { year: "2025.", value: actual }].map((item, index) => <div className="investment-pillar" key={item.year}>
        <motion.div className="investment-pillar-fill" style={{ height: `${item.value / max * 100}%` }}
          initial={{ scaleY: reduced ? 1 : 0 }} animate={{ scaleY: 1 }} transition={{ duration: reduced ? 0 : 1.1, delay: reduced ? 0 : .12 * index, ease }} />
        <strong>{fmtEurCompact(item.value)}</strong><span>Izvršenje {item.year}</span>
      </div>)}
    </div>
    <div className="figure-summary"><div><span>Tekući plan 2025.</span><strong>{fmtEurCompact(plan)}</strong></div><div><span>Izvršenje plana</span><strong>{fmtPct(plan > 0 ? actual / plan * 100 : null)}</strong></div></div>
  </div>;
}

export function ResultFigure({ carried, income, expenditure, financing, result }: {
  carried: number; income: number; expenditure: number; financing: number; result: number;
}) {
  const reduced = useReducedMotion();
  const rows = [
    { label: "Preneseni rezultat", value: carried },
    { label: "Prihodi u 2025.", value: income },
    { label: "Rashodi u 2025.", value: -expenditure },
    { label: "Neto financiranje", value: financing },
  ];
  return <div className="result-figure">
    <p className="result-intro">Svaki dio ima svoje mjesto.<br />Zajedno daju ukupan rezultat.</p>
    <div className="result-ledger">{rows.map((row, index) => <motion.div key={row.label}
      initial={{ opacity: reduced ? 1 : 0, x: reduced ? 0 : 16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ duration: reduced ? 0 : .5, delay: reduced ? 0 : index * .09, ease }}>
      <span className="result-sign">{row.value < 0 ? "−" : "+"}</span><span>{row.label}</span><strong title={fmtEurExact(row.value)}>{fmtEurCompact(Math.abs(row.value))}</strong>
    </motion.div>)}</div>
    <motion.div className="result-total" initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : .4, duration: reduced ? 0 : .5 }}>
      <span>UKUPAN REZULTAT</span><strong title={fmtEurExact(result)}><AnimatedNumber value={result} /></strong><small>Višak na kraju 2025. godine</small>
    </motion.div>
    <p className="figure-caption">Iznosi na prikazu su zaokruženi. Neto financiranje je razlika primitaka i izdataka.</p>
  </div>;
}

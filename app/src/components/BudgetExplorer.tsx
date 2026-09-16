import { useId, useMemo, useState, type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import { hierarchy, treemap } from "d3";
import { ArrowDownLeft, ArrowUpRight, Check, ChevronRight, Download, Layers3, Link2, RotateCcw } from "lucide-react";
import { useData } from "../lib/useData";
import type { FlatRow } from "../lib/types";
import { fmtEurCompact, fmtEurExact } from "../lib/format";
import { downloadCsv } from "../lib/exportView";
import {
  BUDGET_METRICS, budgetFunctions, functionChildren, functionColour, functionLabel,
  metricValue, ratioPercent, readBudgetMetric, sumMetric, type BudgetMetric,
} from "../lib/budgetExplorer";
import "./BudgetExplorer.css";
import { AllocationChart } from "./AllocationChart";

const decimal = new Intl.NumberFormat("hr-HR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const hundredEuros = new Intl.NumberFormat("hr-HR", { style: "currency", currency: "EUR" });
const percent = (value: number | null) => value === null ? "—" : value > 0 && value < .1 ? "< 0,1 %" : `${decimal.format(value)} %`;

interface MapNode { row?: FlatRow; children?: MapNode[] }

export function BudgetExplorer() {
  const { data, loading, error } = useData<FlatRow[]>("funkcijska.json");
  const [params, setParams] = useSearchParams();
  const [shareState, setShareState] = useState<"idle" | "copied" | "fallback">("idle");
  const headingId = useId();
  const detailId = useId();
  const view = params.get("prikaz") === "karta" ? "karta" : params.get("prikaz") === "100" ? "100" : "krug";
  const metric = readBudgetMetric(params.get("mjera"));
  const functions = useMemo(() => budgetFunctions(data ?? []), [data]);
  const ranked = useMemo(() => [...functions].sort((a, b) => metricValue(b, metric) - metricValue(a, metric)), [functions, metric]);
  const selected = functions.find((row) => row.kod === params.get("funkcija"));
  const totals = {
    izvrsenje2025: sumMetric(functions, "izvrsenje2025"),
    tekuciPlan2025: sumMetric(functions, "tekuciPlan2025"),
    izvrsenje2024: sumMetric(functions, "izvrsenje2024"),
  };
  const total = totals[metric];
  const selectedRows = selected ? [selected] : functions;
  const actual = sumMetric(selectedRows, "izvrsenje2025");
  const plan = sumMetric(selectedRows, "tekuciPlan2025");
  const previous = sumMetric(selectedRows, "izvrsenje2024");
  const amount = selected ? metricValue(selected, metric) : total;
  const share = ratioPercent(amount, total);
  const children = selected && data ? functionChildren(data, selected.kod!) : [];
  const title = selected ? functionLabel(selected) : "Sve funkcije proračuna";
  const currentMetric = BUDGET_METRICS.find((item) => item.key === metric)!;
  const difference = actual - plan;
  const growth = previous > 0 ? ((actual - previous) / previous) * 100 : null;

  const tiles = useMemo(() => {
    const root = hierarchy<MapNode>({ children: ranked.filter((row) => metricValue(row, metric) > 0).map((row) => ({ row })) })
      .sum((node) => node.row ? metricValue(node.row, metric) : 0);
    return treemap<MapNode>().size([1000, 660]).paddingInner(4)(root).leaves().filter((node) => node.data.row);
  }, [ranked, metric]);

  function updateParam(key: string, value?: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { preventScrollReset: true });
    setShareState("idle");
  }

  function select(code: string | null) {
    updateParam("funkcija", code === selected?.kod ? undefined : code ?? undefined);
  }

  async function shareView() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareState("copied");
    } catch {
      setShareState("fallback");
    }
  }

  function exportView() {
    const rows = selected ? [selected, ...children] : ranked;
    downloadCsv(`rashodi-${selected?.kod ?? "sve-funkcije"}-${metric}.csv`, rows.map((row) => ({
      "Šifra": row.kod,
      "Funkcija": row.opis,
      "Razina": row.razina,
      "Izvršenje 2024. (EUR)": row.izvrsenje2024,
      "Tekući plan 2025. (EUR)": row.tekuciPlan2025,
      "Izvršenje 2025. (EUR)": row.izvrsenje2025,
      "Prikazana mjera": currentMetric.label,
      "Udio u ukupnim rashodima (%)": ratioPercent(metricValue(row, metric), total),
    })));
  }

  if (error) return (
    <section className="budget-explorer budget-explorer--message" role="alert">
      <h1>Rashodi se trenutačno ne mogu učitati</h1>
      <p>Osvježite stranicu i pokušajte ponovno.</p>
      <button className="be-action" onClick={() => window.location.reload()}>Pokušaj ponovno</button>
    </section>
  );

  if (loading || !data) return (
    <section className="budget-explorer budget-explorer--message" role="status" aria-busy="true">
      <Layers3 size={28} aria-hidden="true" />
      <h1>Kamo odlazi proračun?</h1>
      <p>Učitavam raspodjelu rashoda…</p>
      <div className="be-skeleton" />
    </section>
  );

  if (!functions.length) return (
    <section className="budget-explorer budget-explorer--message" role="status">
      <h1>Kamo odlazi proračun?</h1>
      <p>U izvoru nema podataka za funkcijsku raspodjelu rashoda.</p>
    </section>
  );

  return (
    <section className="budget-explorer" aria-labelledby={headingId}>
      <header className="be-header">
        <div>
          <p className="be-eyebrow">Proračun u fokusu / Istarska županija</p>
          <h1 id={headingId}>Kamo odlazi proračun?</h1>
          <p className="be-intro">Od ukupnog iznosa do pojedine namjene. Odaberite područje i istražite rashode.</p>
        </div>
        <div className="be-actions">
          <button className="be-action" onClick={shareView} aria-label="Kopiraj poveznicu na ovaj prikaz">
            {shareState === "copied" ? <Check size={16} /> : <Link2 size={16} />}
            {shareState === "copied" ? "Kopirano" : "Podijeli"}
          </button>
          <button className="be-action" onClick={exportView}><Download size={16} /> CSV</button>
        </div>
      </header>

      {shareState !== "idle" && <p className="be-share-message" role="status">
        {shareState === "copied" ? "Poveznica na odabrani prikaz je kopirana." : "Za dijeljenje kopirajte adresu iz adresne trake preglednika."}
      </p>}

      <div className="be-toolbar">
        <div className="be-segmented" role="group" aria-label="Podaci za usporedbu">
          {BUDGET_METRICS.map((item) => <button key={item.key} aria-pressed={metric === item.key}
            onClick={() => updateParam("mjera", item.key === "izvrsenje2025" ? undefined : item.key)}>
            {item.label}
          </button>)}
        </div>
        <div className="be-view-switch" role="group" aria-label="Vrsta vizualizacije">{[{ key: "krug", label: "Krug" }, { key: "karta", label: "Karta" }, { key: "100", label: "100 €" }].map(item => <button key={item.key} aria-pressed={view === item.key} onClick={() => updateParam("prikaz", item.key)}>{item.label}</button>)}</div>
      </div>

      <div className="be-workspace">
        <div className="be-distribution">
          <div className="be-map-heading">
            <div><p className="be-eyebrow">Ukupni rashodi · {currentMetric.label}</p><p className="be-total" title={fmtEurExact(total)}>{fmtEurCompact(total)}</p></div>
            <span className="be-map-hint"><Layers3 size={15} aria-hidden="true" /> {view === "krug" ? "Duljina luka = udio" : view === "karta" ? "Veličina polja = iznos" : "Jedno polje ≈ 1 €"}</span>
          </div>

          {view !== "karta" ? <AllocationChart rows={ranked} metric={metric} selected={selected?.kod} onSelect={select} mode={view === "100" ? "hundred" : "ring"} /> : <div className="be-treemap" role="group" aria-label={`Raspodjela rashoda: ${currentMetric.label}. Sve kategorije dostupne su u popisu ispod.`}>
            {tiles.map((tile) => {
              const row = tile.data.row!;
              const value = metricValue(row, metric);
              const tileShare = ratioPercent(value, total);
              const prominent = (tileShare ?? 0) >= 9;
              const showLabel = (tileShare ?? 0) >= 3 && tile.x1 - tile.x0 > 100 && tile.y1 - tile.y0 > 85;
              return <button key={row.kod} className={`be-tile ${prominent ? "be-tile--large" : ""} ${tile.x1 - tile.x0 < 320 ? "be-tile--narrow" : ""} ${tile.y1 - tile.y0 < 150 ? "be-tile--shallow" : ""}`}
                style={{ left: `${tile.x0 / 10}%`, top: `${tile.y0 / 6.6}%`, width: `${(tile.x1 - tile.x0) / 10}%`, height: `${(tile.y1 - tile.y0) / 6.6}%`, background: functionColour(row.kod) }}
                data-muted={Boolean(selected && selected.kod !== row.kod)}
                aria-pressed={selected?.kod === row.kod} aria-controls={detailId}
                aria-label={`${functionLabel(row)}: ${fmtEurExact(value)}, ${percent(tileShare)} ukupnih rashoda`}
                title={`${functionLabel(row)} · ${fmtEurExact(value)} · ${percent(tileShare)}`}
                tabIndex={-1} onClick={() => select(row.kod)}>
                {showLabel && <><span className="be-tile-code" aria-hidden="true">{row.kod}</span><span className="be-tile-name">{functionLabel(row)}</span><span className="be-tile-value">{fmtEurCompact(value)}</span>
                  {prominent && <span className="be-tile-share">{percent(tileShare)} rashoda <ArrowUpRight size={18} /></span>}</>}
              </button>;
            })}
            {total <= 0 && <p className="be-map-empty">Nema pozitivnih iznosa za odabranu mjeru.</p>}
          </div>}

          <p className="be-legend-hint">Odaberite naziv funkcije za objašnjenje i detalje.</p>
          <div className="be-legend" role="group" aria-label="Odaberi funkciju rashoda">
            {ranked.map((row) => <button key={row.kod} className="be-legend-item" aria-pressed={selected?.kod === row.kod}
              aria-controls={detailId} onClick={() => select(row.kod)}>
              <span className="be-swatch" style={{ background: functionColour(row.kod) }} />
              <span className="be-legend-name">{functionLabel(row)}</span>
              <span className="be-legend-value">{percent(ratioPercent(metricValue(row, metric), total))}</span>
            </button>)}
          </div>
        </div>

        <aside id={detailId} className="be-detail" style={{ "--be-accent": selected ? functionColour(selected.kod) : "#1267a7" } as CSSProperties}
          aria-label="Detalji odabrane funkcije" aria-live="polite" aria-atomic="true">
          <div className="be-detail-top"><p className="be-eyebrow">{selected ? `Funkcija ${selected.kod}` : "Pregled cjeline"}</p>
            {selected && <button className="be-reset" onClick={() => updateParam("funkcija")}><RotateCcw size={13} /> Sve funkcije</button>}
          </div>
          <h2>{title}</h2>
          <p className="be-explainer">{selected ? `Prikaz izdvaja rashode za namjenu „${functionLabel(selected).toLocaleLowerCase("hr-HR")}”, neovisno o upravnom tijelu koje ih izvršava.` : "Svaka boja predstavlja jednu javnu namjenu. Odaberite funkciju za njezin udio, usporedbu godina i potkategorije."}</p>
          <p className="be-detail-amount" title={fmtEurExact(amount)}>{fmtEurCompact(amount)}</p>
          <p className="be-caption">{currentMetric.short}</p>

          <div className="be-hundred">
            <span>Od svakih 100 € rashoda</span>
            <strong>{share === null ? "—" : hundredEuros.format(share)}</strong>
            <p>{selected ? `odnosi se na: ${functionLabel(selected).toLocaleLowerCase("hr-HR")}.` : "raspoređeno je među prikazanim funkcijama."}</p>
          </div>

          <div className="be-comparison">
            <h3>Plan i ostvarenje</h3>
            {BUDGET_METRICS.map((item) => <ComparisonBar key={item.key} label={item.label}
              value={sumMetric(selectedRows, item.key)} max={Math.max(actual, plan, previous)} metric={item.key} />)}
            <div className="be-execution"><span>Izvršenje plana 2025.</span><strong>{percent(ratioPercent(actual, plan))}</strong></div>
          </div>

          <div className="be-difference">
            {difference > 0 ? <ArrowUpRight size={18} aria-hidden="true" /> : <ArrowDownLeft size={18} aria-hidden="true" />}
            <p>{difference === 0 ? "Rashodi su jednaki tekućem planu." : <><strong>{fmtEurCompact(Math.abs(difference))}</strong> {difference > 0 ? "iznad" : "ispod"} tekućeg plana.</>}
              {growth !== null && <span> {percent(Math.abs(growth))} {growth >= 0 ? "više" : "manje"} rashoda nego 2024.</span>}</p>
          </div>
        </aside>
      </div>

      {selected && <div className="be-breakdown">
        <div className="be-breakdown-heading"><div><p className="be-eyebrow">Detaljnija raspodjela</p><h2>{title}</h2></div><span className="be-caption">{currentMetric.label}</span></div>
        {children.length > 0 ? <div className="be-child-list">
          {[...children].sort((a, b) => metricValue(b, metric) - metricValue(a, metric)).map((row) => {
            const value = metricValue(row, metric);
            const childShare = ratioPercent(value, amount);
            return <div className="be-child" key={row.kod}>
              <span className="be-child-code">{row.kod}</span><div className="be-child-main"><span>{functionLabel(row)}</span>
                <div className="be-child-track" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(100, childShare ?? 0))}%`, background: functionColour(row.kod) }} /></div>
              </div><div className="be-child-values"><strong>{fmtEurExact(value)}</strong><span>{percent(childShare)} funkcije</span></div>
            </div>;
          })}
        </div> : <p className="be-caption">Izvor ne sadrži detaljniju raspodjelu za ovu funkciju.</p>}
      </div>}

      <footer className="be-source"><span>Izvor: godišnji izvještaj 2025. · funkcijska klasifikacija</span>
        <a href={`${import.meta.env.BASE_URL}izvornici/OPCI-I-POSEBNI-DIO.xlsx`} download>Izvorni podaci <ChevronRight size={14} /></a>
        <p>Prikaz obuhvaća rashode bez izdataka za financijsku imovinu i otplate zajmova. Udjeli su izračunati iz odabrane mjere; moguća su odstupanja u zbroju zbog zaokruživanja.</p>
      </footer>
    </section>
  );
}

function ComparisonBar({ label, value, max, metric }: { label: string; value: number; max: number; metric: BudgetMetric }) {
  return <div className="be-compare-row">
    <div><span>{label}</span><strong title={fmtEurExact(value)}>{fmtEurCompact(value)}</strong></div>
    <div className="be-compare-track" aria-hidden="true"><span data-metric={metric} style={{ width: `${max > 0 ? Math.max(0, value / max * 100) : 0}%` }} /></div>
  </div>;
}

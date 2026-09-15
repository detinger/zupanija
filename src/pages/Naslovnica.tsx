import { Link } from "react-router-dom";
import { ArrowRight, Coins, TrendingDown, Building2, GitBranch, HardHat, Scale } from "lucide-react";
import { useData } from "../lib/useData";
import type { SazetakRow, FlatRow, Razdjel } from "../lib/types";
import { KpiCard } from "../components/KpiCard";
import { BarChart } from "../components/BarChart";
import { PageSkeleton } from "../components/Skeleton";
import { fmtEurCompact, fmtPct } from "../lib/format";
import { budgetFunctions, functionColour, functionLabel, sumMetric } from "../lib/budgetExplorer";
export function Naslovnica() {
  const { data: rows, loading } = useData<SazetakRow[]>("sazetak.json");
  const { data: functions } = useData<FlatRow[]>("funkcijska.json");
  const { data: departments } = useData<Razdjel[]>("programska.json");
  if (loading || !rows) return <PageSkeleton />;
  const find = (name: string) => rows.find(r => r.kind === "row" && r.opis === name);
  const income = find("Ukupni prihodi");
  const expenditure = find("Ukupni rashodi");
  const balance = find("UKUPAN VIŠAK/MANJAK");
  const investment = find("RASHODI ZA NABAVU NEFINANCIJSKE IMOVINE");
  const groups = budgetFunctions(functions ?? []).sort((a,b) => (b.izvrsenje2025 ?? 0) - (a.izvrsenje2025 ?? 0));
  const total = sumMetric(groups, "izvrsenje2025");
  const programs = departments?.flatMap(r => r.glave.flatMap(g => [...g.programi, ...g.korisnici.flatMap(k => k.programi)]));
  const charts = [
    { key: "prihodi", label: "Prihodi", plan: income?.tekuciPlan2025 ?? 0, izvrsenje: income?.izvrsenje2025 ?? 0 },
    { key: "rashodi", label: "Rashodi", plan: expenditure?.tekuciPlan2025 ?? 0, izvrsenje: expenditure?.izvrsenje2025 ?? 0 },
    { key: "imovina", label: "Od toga: nabava imovine", plan: investment?.tekuciPlan2025 ?? 0, izvrsenje: investment?.izvrsenje2025 ?? 0 },
  ];
  return <div className="space-y-7">
    <header className="home-heading"><div><p className="eyebrow">Godišnji izvještaj · Istarska županija</p><h1>Proračun 2025.</h1><p>Prihodi, ulaganja i javne usluge — istražite što stoji iza brojki.</p></div><Link to="/rashodi" className="primary-link">Istraži rashode <ArrowRight size={17} /></Link></header>
    <section className="grid grid-cols-1 gap-4 min-[360px]:grid-cols-2 xl:grid-cols-4" aria-label="Ključni pokazatelji">
      <KpiCard label="Ukupni prihodi" value={fmtEurCompact(income?.izvrsenje2025)} sub={`${fmtPct(income?.indeks42)} tekućeg plana`} icon={Coins} />
      <KpiCard label="Ukupni rashodi" value={fmtEurCompact(expenditure?.izvrsenje2025)} sub={`${fmtPct(expenditure?.indeks42)} tekućeg plana`} icon={TrendingDown} accent="green" />
      <KpiCard label="Nabava nefinancijske imovine" value={fmtEurCompact(investment?.izvrsenje2025)} sub={`${fmtPct(investment?.indeks42)} tekućeg plana`} icon={HardHat} />
      <KpiCard label="Ukupan višak na kraju godine" value={fmtEurCompact(balance?.izvrsenje2025)} sub="Uključuje prenesena sredstva" icon={Scale} accent="gold" />
    </section>
    <section className="dashboard-grid">
      <div className="dashboard-panel"><div className="panel-heading"><div><h2>Kamo odlazi novac?</h2><p>Raspodjela izvršenih rashoda po namjeni</p></div><Link to="/rashodi">Sve funkcije <ArrowRight size={14} /></Link></div>
        <div className="allocation-band" aria-label="Udjeli funkcija u rashodima">{groups.map(r => <Link key={r.kod} to={`/rashodi?funkcija=${r.kod}`} style={{ flexGrow: r.izvrsenje2025 ?? 0, background: functionColour(r.kod) }} title={`${functionLabel(r)}: ${fmtEurCompact(r.izvrsenje2025)}`} aria-label={functionLabel(r)} />)}</div>
        {groups.slice(0,5).map(r => <Link className="allocation-row" key={r.kod} to={`/rashodi?funkcija=${r.kod}`}><i style={{ background: functionColour(r.kod) }} /><span>{functionLabel(r)}</span><strong>{fmtEurCompact(r.izvrsenje2025)}</strong><small>{fmtPct(total ? (r.izvrsenje2025 ?? 0)/total*100 : null)}</small></Link>)}
        {groups.length > 5 && <Link to="/rashodi" className="allocation-row"><i style={{background:'#78909f'}}/><span>Ostale funkcije</span><strong>{fmtEurCompact(sumMetric(groups.slice(5), "izvrsenje2025"))}</strong><ArrowRight size={14}/></Link>}
      </div>
      <div className="dashboard-panel"><div className="panel-heading"><div><h2>Od plana do ostvarenja</h2><p>Tekući plan i izvršenje u 2025. godini</p></div></div><BarChart data={charts} exportName="pregled-proracuna-2025" />
        <p className="home-note mt-6">Ukupan višak uključuje preneseni višak iz prethodnih godina i neto financiranje. Razlika prihoda i rashoda u samoj 2025. iznosi <strong>{fmtEurCompact((income?.izvrsenje2025 ?? 0) - (expenditure?.izvrsenje2025 ?? 0))}</strong>.</p>
      </div>
    </section>
    <section className="home-links" aria-label="Istražite proračun">{[
      { to:"/programska", title:"Programi i projekti", text: programs ? `${programs.length.toLocaleString('hr')} programa i ${programs.reduce((s,p)=>s+p.aktivnosti.length,0).toLocaleString('hr')} aktivnosti i projekata. Od cjeline do pojedine stavke.` : "Istražite programe, projekte i njihove aktivnosti.", icon:GitBranch },
      { to:"/organizacijska", title:"Tko upravlja sredstvima?", text:"Usporedite upravna tijela i otvorite programe pojedinog razdjela.", icon:Building2 },
      { to:"/investicije", title:"Ulaganja u Istru", text:"Kapitalni projekti, planirani iznosi i njihova realizacija.", icon:HardHat },
    ].map(c=><Link className="home-link" key={c.to} to={c.to}><div><c.icon size={23}/><ArrowRight size={18}/></div><h2>{c.title}</h2><p>{c.text}</p></Link>)}</section>
  </div>;
}

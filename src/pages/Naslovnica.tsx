import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ArrowLeft, Maximize2, Minimize2, Lightbulb, BookOpen, Building2, GitBranch, HardHat } from "lucide-react";
import { useData } from "../lib/useData";
import type { SazetakRow, FlatRow, Razdjel } from "../lib/types";
import { AllocationChart } from "../components/AllocationChart";
import { BarChart } from "../components/BarChart";
import { PageSkeleton } from "../components/Skeleton";
import { fmtEurCompact, fmtEurExact } from "../lib/format";
import { budgetFunctions, functionColour, functionLabel, sumMetric } from "../lib/budgetExplorer";

const CHAPTERS = ["Velika slika", "Svakih 100 €", "Plan i ostvarenje", "Ulaganja", "Rezultat godine"];
const percentage = (value: number, total: number) => total <= 0 ? "—" : value > 0 && value / total * 100 < .1 ? "< 0,1 %" : `${(value / total * 100).toLocaleString("hr-HR", { maximumFractionDigits: 1 })} %`;
export function Naslovnica() {
  const { data: rows, loading } = useData<SazetakRow[]>("sazetak.json");
  const { data: functions, loading: functionsLoading } = useData<FlatRow[]>("funkcijska.json");
  const { data: departments } = useData<Razdjel[]>("programska.json");
  const [params, setParams] = useSearchParams();
  const reduceMotion = useReducedMotion();
  const chapterValue = Number(params.get("poglavlje") ?? 1);
  const chapter = Number.isInteger(chapterValue) && chapterValue >= 1 && chapterValue <= 5 ? chapterValue - 1 : 0;
  const focused = params.get("prezentacija") === "1";
  const stageRef = useRef<HTMLElement>(null);
  function update(key: string, value: string | null) { const next = new URLSearchParams(params); if (value) next.set(key, value); else next.delete(key); setParams(next, { preventScrollReset: true }); }
  function go(index: number) { if (index < 0 || index >= CHAPTERS.length) return; update("poglavlje", String(index + 1)); stageRef.current?.focus({ preventScroll: true }); }
  if (loading || functionsLoading || !rows || !functions) return <PageSkeleton />;
  const find = (name: string) => rows.find(r => r.kind === "row" && r.opis === name);
  const income = find("Ukupni prihodi")?.izvrsenje2025 ?? 0;
  const expenditure = find("Ukupni rashodi")?.izvrsenje2025 ?? 0;
  const balance = find("UKUPAN VIŠAK/MANJAK")?.izvrsenje2025 ?? 0;
  const investment = find("RASHODI ZA NABAVU NEFINANCIJSKE IMOVINE")!;
  const groups = budgetFunctions(functions).sort((a,b) => (b.izvrsenje2025 ?? 0) - (a.izvrsenje2025 ?? 0));
  const selected = groups.find(row => row.kod === params.get("funkcija")) ?? groups[0];
  const total = sumMetric(groups, "izvrsenje2025");
  const programs = departments?.flatMap(r => r.glave.flatMap(g => [...g.programi, ...g.korisnici.flatMap(k => k.programi)]));
  const investments = [
    { key: "2024", label: "Izvršenje 2024.", plan: 0, izvrsenje: investment.izvrsenje2024 ?? 0 },
    { key: "2025", label: "Izvršenje 2025.", plan: investment.tekuciPlan2025 ?? 0, izvrsenje: investment.izvrsenje2025 ?? 0 },
  ];
  const charts = ["Ukupni prihodi", "Ukupni rashodi"].map((name, index) => ({ key: String(index), label: name, plan: find(name)?.tekuciPlan2025 ?? 0, izvrsenje: find(name)?.izvrsenje2025 ?? 0 }));
  const titles = [<>Proračun.<br /><em>U perspektivi.</em></>, <>Što financira<br /><em>svakih 100 €?</em></>, <>Plan je polazište.<br /><em>Izvršenje je rezultat.</em></>, <>Ulaganja danas.<br /><em>Vrijednost za sutra.</em></>, <>Godina u brojkama.<br /><em>Iza završnog salda.</em></>];
  const descriptions = ["Od ukupnih rashoda do javnih usluga. Istražite kako su sredstva Istarske županije raspoređena u 2025. godini.", "Velike iznose lakše je razumjeti na malom primjeru. Odaberite namjenu i otkrijte njezin udio u zajedničkom proračunu.", "Usporedite ono što je planirano s onim što je ostvareno. Klik na stavku otkriva razliku u eurima i postotak izvršenja.", "Nabava nefinancijske imovine obuhvaća dugotrajnu imovinu poput zgrada i opreme. Pratite promjenu i ostvarenje plana.", "Godišnja razlika prihoda i rashoda samo je dio rezultata. Završni saldo uključuje i prenesena sredstva te neto financiranje."];
  const note = chapter < 2 && selected ? `${functionLabel(selected)} čini ${percentage(selected.izvrsenje2025 ?? 0, total)} ukupnih rashoda. Odabir mijenja naglasak na grafu, a detalji otvaraju potkategorije i usporedbu godina.` : chapter === 2 ? "Postotak izvršenja govori koliki je dio tekućeg plana ostvaren. Sam po sebi ne objašnjava razloge odstupanja; njih potražite u izvornom obrazloženju." : chapter === 3 ? "Nabava imovine i kapitalni projekti imaju različit obuhvat. Iznosi se ne zbrajaju: projekti su dostupni u zasebnom programskom pregledu." : "Višak na kraju godine nije jednak razlici godišnjih prihoda i rashoda, niti sam po sebi znači da su sva sredstva slobodna za trošenje.";
  return <div className={`budget-story ${focused ? "is-presenting" : ""}`}>
    <header className="story-masthead"><div><span className="story-edition">GODIŠNJI IZVJEŠTAJ</span><span>Istarska županija / 2025.</span></div><button className="story-focus" aria-pressed={focused} onClick={() => update("prezentacija", focused ? null : "1")}>{focused ? <Minimize2 size={16} /> : <Maximize2 size={16} />}{focused ? "Zatvori prezentaciju" : "Način prezentacije"}</button></header>
    <nav className="chapter-nav" aria-label="Poglavlja prezentacije">{CHAPTERS.map((label, i) => <button key={label} aria-current={i === chapter ? "step" : undefined} onClick={() => go(i)}><span>{String(i + 1).padStart(2, "0")}</span>{label}</button>)}</nav>
    <section className="story-stage" ref={stageRef} tabIndex={0} aria-label={`${chapter + 1}. ${CHAPTERS[chapter]}. Za promjenu poglavlja koristite strelice lijevo i desno.`} onKeyDown={event => {
      if (event.key === "Escape" && focused) { update("prezentacija", null); return; }
      if (event.target !== event.currentTarget) return;
      if (event.key === "ArrowRight") { event.preventDefault(); go(chapter + 1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); go(chapter - 1); }
    }}>
      <AnimatePresence mode="wait" initial={false}><motion.div key={chapter} className="story-slide" initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .22 }}>
        <div className="story-copy"><p className="story-kicker"><span>{String(chapter + 1).padStart(2, "0")}</span> {CHAPTERS[chapter]}</p><h1>{titles[chapter]}</h1><p className="story-description">{descriptions[chapter]}</p>
          <div className="story-stat"><span>{chapter === 4 ? "Ukupan višak na kraju godine" : chapter === 3 ? "Nabava imovine · izvršenje 2025." : chapter === 2 ? "Ostvarenje plana rashoda" : "Ukupni rashodi · izvršenje 2025."}</span><strong title={fmtEurExact(chapter === 4 ? balance : chapter === 3 ? investment.izvrsenje2025 : expenditure)}>{chapter === 4 ? fmtEurCompact(balance) : chapter === 3 ? fmtEurCompact(investment.izvrsenje2025) : chapter === 2 ? percentage(expenditure, charts[1].plan) : fmtEurCompact(expenditure)}</strong></div>
          <Link className="story-detail-link" to={chapter === 3 ? "/investicije" : chapter === 4 ? "/financiranje" : chapter === 2 ? "/prihodi" : `/rashodi?funkcija=${selected?.kod ?? ""}`}>{chapter === 3 ? "Istražite kapitalne projekte" : chapter === 4 ? "Istražite financiranje" : chapter === 2 ? "Otvorite detaljnu usporedbu" : "Istražite odabranu namjenu"}<ArrowUpRight size={18} /></Link>
        </div>
        <div className={`story-visual story-visual--${chapter}`}>
          {chapter < 2 ? <><div className="story-visual-heading"><span>RASPODJELA PO NAMJENI</span><span>{chapter === 0 ? "Kliknite segment ili naziv" : "100 polja · 100 €"}</span></div><AllocationChart rows={groups} selected={selected?.kod} onSelect={code => update("funkcija", code)} mode={chapter === 1 ? "hundred" : "ring"} /><div className="story-function-list" aria-label="Odaberite namjenu">{groups.map(row => <button key={row.kod} aria-pressed={selected?.kod === row.kod} onClick={() => update("funkcija", row.kod)}><i style={{ background: functionColour(row.kod) }} /><span>{functionLabel(row)}</span><strong>{percentage(row.izvrsenje2025 ?? 0, total)}</strong></button>)}</div></> : chapter === 2 ? <><div className="story-visual-heading"><span>PLAN → IZVRŠENJE</span><span>2025. / EUR</span></div><BarChart data={charts} exportName="plan-i-ostvarenje" /><div className="story-mini-stats"><div><span>Ostvareni prihodi</span><strong>{fmtEurCompact(income)}</strong></div><div><span>Izvršeni rashodi</span><strong>{fmtEurCompact(expenditure)}</strong></div></div></> : chapter === 3 ? <><div className="story-visual-heading"><span>NABAVA NEFINANCIJSKE IMOVINE</span><HardHat size={20} /></div><div className="investment-columns">{investments.map(item => <div key={item.key}><strong>{fmtEurCompact(item.izvrsenje)}</strong><div className="investment-column-space"><div style={{ height: `${item.izvrsenje / Math.max(1, ...investments.map(r => r.izvrsenje)) * 100}%` }} /></div><span>{item.label}</span></div>)}</div><div className="story-mini-stats"><div><span>Tekući plan 2025.</span><strong>{fmtEurCompact(investment.tekuciPlan2025)}</strong></div><div><span>Izvršenje plana</span><strong>{percentage(investment.izvrsenje2025 ?? 0, investment.tekuciPlan2025 ?? 0)}</strong></div></div></> : <><div className="story-visual-heading"><span>OD PRIHODA DO GODIŠNJE RAZLIKE</span><BookOpen size={19} /></div><div className="balance-equation"><div><span>Ukupni prihodi</span><strong>{fmtEurCompact(income)}</strong></div><b>−</b><div><span>Ukupni rashodi</span><strong>{fmtEurCompact(expenditure)}</strong></div><b>=</b><div className="balance-result"><span>Razlika u 2025.</span><strong>{fmtEurCompact(income - expenditure)}</strong></div></div><p className="balance-explanation">Završni višak od <strong>{fmtEurCompact(balance)}</strong> uključuje i prenesena sredstva te neto financiranje. Cjelovit obračun nalazi se u računu financiranja i izvornim dokumentima.</p></>}
        </div>
      </motion.div></AnimatePresence>
      <div className="story-insight" aria-live="polite"><Lightbulb size={21} /><div><strong>Kako čitati ove podatke</strong><p>{note}</p></div></div>
      <footer className="story-controls"><span><strong>{String(chapter + 1).padStart(2, "0")}</strong> / 05 <span className="story-key-hint">· Tipke ← → mijenjaju poglavlje kad je prezentacija u fokusu</span></span><div><button aria-label="Prethodno poglavlje" disabled={chapter === 0} onClick={() => go(chapter - 1)}><ArrowLeft size={18} /></button>{chapter < 4 ? <button className="story-next" onClick={() => go(chapter + 1)}>Sljedeće poglavlje <ArrowRight size={18} /></button> : <button className="story-next" onClick={() => go(0)}>Na početak <ArrowRight size={18} /></button>}</div></footer>
    </section>
    <section className="story-explore"><div className="story-explore-title"><span>DUBLJE U PODATKE</span><p>Nastavite vlastitim putem.</p></div>{[{ to: "/programska", title: "Programi i projekti", text: programs ? `${programs.length} programa · ${programs.reduce((sum, p) => sum + p.aktivnosti.length, 0).toLocaleString("hr-HR")} aktivnosti i projekata` : "Od razdjela do pojedine aktivnosti", icon: GitBranch }, { to: "/organizacijska", title: "Upravna tijela", text: "Tko upravlja sredstvima?", icon: Building2 }, { to: "/preuzimanja", title: "Izvori i obrazloženja", text: "Izvorni dokumenti i puni izvještaj", icon: BookOpen }].map(item => <Link key={item.to} to={item.to}><item.icon size={22} /><div><strong>{item.title}</strong><span>{item.text}</span></div><ArrowUpRight size={18} /></Link>)}</section>
  </div>;
}

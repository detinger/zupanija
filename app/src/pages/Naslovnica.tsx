import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ArrowLeft, Maximize2, Minimize2, BookOpen, Building2, GitBranch, CircleHelp } from "lucide-react";
import { useData } from "../lib/useData";
import type { SazetakRow, FlatRow } from "../lib/types";
import { KineticAllocation } from "../components/KineticAllocation";
import { InvestmentFigure, PlanFigure, ResultFigure } from "../components/StoryFigures";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { PageSkeleton } from "../components/Skeleton";
import { fmtEurExact } from "../lib/format";
import { budgetFunctions, functionLabel, sumMetric } from "../lib/budgetExplorer";

const CHAPTERS = [
  { label: "Velika slika", title: ["Proračun.", "U perspektivi."], description: "Iza svakog iznosa stoji dio svakodnevice. Istražite kako su sredstva Istarske županije raspoređena u 2025. godini.", figure: "Deset namjena. Jedna cjelina." },
  { label: "Svakih 100 €", title: ["Veliki iznosi.", "Bliska perspektiva."], description: "Što financira svakih 100 € rashoda? Sto polja pretvara proračun u razumljivu sliku. Odaberite namjenu i pogledajte njezin udio.", figure: "Proračun, sveden na 100 €." },
  { label: "Plan i ostvarenje", title: ["Plan je polazište.", "Izvršenje je ostvarenje."], description: "Dvije vrijednosti, potpunija slika. Usporedite tekući plan s ostvarenim prihodima i izvršenim rashodima.", figure: "Od planiranog do ostvarenog." },
  { label: "Ulaganja", title: ["Ulaganja danas.", "Vrijednost za sutra."], description: "Zgrade, oprema i druga dugotrajna imovina. Pogledajte koliko je uloženo u 2025. i kako se iznos promijenio u odnosu na godinu ranije.", figure: "Ulaganja u dugotrajnu imovinu." },
  { label: "Rezultat godine", title: ["Godina u brojkama.", "Cjelovita slika."], description: "Godišnja razlika prihoda i rashoda samo je dio priče. Preneseni rezultat i neto financiranje daju joj potpuni kontekst.", figure: "Kako nastaje ukupan rezultat?" },
];
const ease = [.22, 1, .36, 1] as const;
const percentage = (value: number, total: number) => total <= 0 ? "—" : value > 0 && value / total * 100 < .1 ? "< 0,1 %" : `${(value / total * 100).toLocaleString("hr-HR", { maximumFractionDigits: 1 })} %`;

export function Naslovnica() {
  const { data: rows, loading } = useData<SazetakRow[]>("sazetak.json");
  const { data: functions, loading: functionsLoading } = useData<FlatRow[]>("funkcijska.json");
  const [params, setParams] = useSearchParams();
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLElement>(null);
  const chapterRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const chapterValue = Number(params.get("poglavlje") ?? 1);
  const chapter = Number.isInteger(chapterValue) && chapterValue >= 1 && chapterValue <= CHAPTERS.length ? chapterValue - 1 : 0;
  const focused = params.get("prezentacija") === "1";

  function update(key: string, value?: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { preventScrollReset: true });
  }
  function go(index: number) {
    if (index < 0 || index >= CHAPTERS.length) return;
    update("poglavlje", String(index + 1));
    stageRef.current?.focus({ preventScroll: true });
    chapterRefs.current[index]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduced ? "instant" : "smooth" });
  }

  if (loading || functionsLoading || !rows || !functions) return <PageSkeleton />;
  const find = (name: string) => rows.find(row => row.kind === "row" && row.opis === name);
  const income = find("Ukupni prihodi")?.izvrsenje2025 ?? 0;
  const expenditure = find("Ukupni rashodi")?.izvrsenje2025 ?? 0;
  const result = find("UKUPAN VIŠAK/MANJAK")?.izvrsenje2025 ?? 0;
  const investment = find("RASHODI ZA NABAVU NEFINANCIJSKE IMOVINE");
  const investmentActual = investment?.izvrsenje2025 ?? 0;
  const expenditurePlan = find("Ukupni rashodi")?.tekuciPlan2025 ?? 0;
  const groups = budgetFunctions(functions).sort((a, b) => (b.izvrsenje2025 ?? 0) - (a.izvrsenje2025 ?? 0));
  const selected = groups.find(row => row.kod === params.get("funkcija"));
  const total = sumMetric(groups, "izvrsenje2025");
  const info = CHAPTERS[chapter];
  const stat = chapter === 4 ? result : chapter === 3 ? investmentActual : chapter === 2 ? (expenditurePlan > 0 ? expenditure / expenditurePlan * 100 : 0) : expenditure;
  const note = chapter < 2 ? selected
    ? `${functionLabel(selected)} čini ${percentage(selected.izvrsenje2025 ?? 0, total)} ukupnih rashoda. Otvorite detalje za potkategorije i usporedbu godina.`
    : "Funkcijska klasifikacija pokazuje namjenu rashoda. Odaberite područje na grafu ili u popisu i istražite njegov udio."
    : chapter === 2 ? "Postotak izvršenja govori koliki je dio tekućeg plana ostvaren. Razloge odstupanja potražite u izvornom obrazloženju."
    : chapter === 3 ? "Nabava imovine i kapitalni projekti imaju različit obuhvat. Njihovi iznosi ne zbrajaju se međusobno."
    : "Višak na kraju godine nije jednak razlici godišnjih prihoda i rashoda i ne znači da su sva sredstva slobodna za trošenje.";
  const destination = chapter === 4 ? "/financiranje" : chapter === 3 ? "/investicije" : chapter === 2 ? "/prihodi" : `/rashodi${selected ? `?funkcija=${selected.kod}` : ""}`;
  const destinationLabel = chapter === 4 ? "Istražite financiranje" : chapter === 3 ? "Istražite kapitalne projekte" : chapter === 2 ? "Usporedite sve stavke" : selected ? "Istražite odabranu namjenu" : "Istražite rashode";

  return <div className={`budget-story ${focused ? "is-presenting" : ""}`}>
    <header className="story-masthead">
      <div><span className="story-edition"><i />PRORAČUN OTVOREN ZA SVE</span><span className="story-place">Istarska županija · 2025.</span></div>
      <button className="story-focus" aria-pressed={focused} onClick={() => update("prezentacija", focused ? undefined : "1")}>
        {focused ? <Minimize2 size={15} /> : <Maximize2 size={15} />}{focused ? "Zatvori prezentaciju" : "Način prezentacije"}
      </button>
    </header>

    <nav className="chapter-nav" aria-label="Poglavlja proračuna">
      {CHAPTERS.map((item, index) => <button key={item.label} ref={element => { chapterRefs.current[index] = element; }}
        aria-current={index === chapter ? "step" : undefined} onClick={() => go(index)}>
        <span>{String(index + 1).padStart(2, "0")}</span><strong>{item.label}</strong>
        {index === chapter && <motion.i layoutId="chapter-underline" transition={{ duration: reduced ? 0 : .45, ease }} />}
      </button>)}
    </nav>

    <section className="story-stage" ref={stageRef} tabIndex={0} data-chapter={chapter}
      aria-label={`${chapter + 1}. ${info.label}. Za promjenu poglavlja koristite strelice lijevo i desno.`}
      onKeyDown={event => {
        if (event.key === "Escape" && focused) { update("prezentacija"); return; }
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowRight") { event.preventDefault(); go(chapter + 1); }
        if (event.key === "ArrowLeft") { event.preventDefault(); go(chapter - 1); }
      }}>
      <div className="story-composition">
        <div className="story-copy">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={chapter} className="story-copy-content"
              initial={{ opacity: 0, y: reduced ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -8 }}
              transition={{ duration: reduced ? 0 : .3, ease }}>
              <p className="story-kicker"><span>{String(chapter + 1).padStart(2, "0")}</span>{info.label}<i /></p>
              <h1>{info.title.map((line, index) => <span className="story-title-line" key={line}>
                <motion.span className={index === 1 ? "story-title-accent" : undefined}
                  initial={{ y: reduced ? 0 : "110%" }} animate={{ y: 0 }} transition={{ duration: reduced ? 0 : .75, delay: reduced ? 0 : .05 + index * .09, ease }}>{line}</motion.span>
              </span>)}</h1>
              <p className="story-description">{info.description}</p>
            </motion.div>
          </AnimatePresence>
          <div className="story-stat">
            <span>{chapter === 4 ? "Ukupan rezultat · višak na kraju godine" : chapter === 3 ? "Nabava imovine · izvršenje 2025." : chapter === 2 ? "Ostvarenje plana rashoda" : "Ukupni rashodi · izvršenje 2025."}</span>
            <strong title={chapter === 2 ? undefined : fmtEurExact(stat)}><AnimatedNumber key={chapter === 2 ? "percent" : "eur"} value={stat} format={chapter === 2 ? "percent" : "eur"} /></strong>
          </div>
          <Link className="story-detail-link" to={destination}><span>{destinationLabel}</span><span className="story-link-arrow"><ArrowUpRight size={19} /></span></Link>
          <div className="story-copy-bottom"><span>Godišnji izvještaj o izvršenju proračuna</span><span>2025 <i /></span></div>
        </div>

        <div className={`story-visual story-visual--${chapter}`}>
          <div className="story-visual-heading"><div><span>PRORAČUN U POKRETU</span><h2>{info.figure}</h2></div><span className="story-visual-year">’25</span></div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={chapter < 2 ? "allocation" : chapter} className="story-figure-body"
              initial={{ opacity: 0, y: reduced ? 0 : 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -10 }}
              transition={{ duration: reduced ? 0 : .3, ease }}>
              {chapter < 2 ? <>
                <div className="story-shape-switch" role="group" aria-label="Raspored prikaza svakih 100 eura">
                  <button aria-pressed={chapter === 0} onClick={() => go(0)}>Krug</button>
                  <button aria-pressed={chapter === 1} onClick={() => go(1)}>Mreža 100 €</button>
                </div>
                <KineticAllocation rows={groups} selected={selected?.kod ?? undefined} mode={chapter === 0 ? "orbit" : "grid"} onSelect={code => update("funkcija", code)} />
              </> : chapter === 2 ? <PlanFigure rows={[
                { label: "Prihodi", actual: income, plan: find("Ukupni prihodi")?.tekuciPlan2025 ?? 0 },
                { label: "Rashodi", actual: expenditure, plan: expenditurePlan },
              ]} /> : chapter === 3 ? <InvestmentFigure previous={investment?.izvrsenje2024 ?? 0} actual={investmentActual} plan={investment?.tekuciPlan2025 ?? 0} />
              : <ResultFigure carried={find("Višak/manjak iz prethodnih godina")?.izvrsenje2025 ?? 0} income={income} expenditure={expenditure} financing={find("Neto financiranje")?.izvrsenje2025 ?? 0} result={result} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <footer className="story-controls">
        <div className="story-progress"><span>{String(chapter + 1).padStart(2, "0")}<small> / 05</small></span><div aria-hidden="true"><motion.i animate={{ scaleX: (chapter + 1) / CHAPTERS.length }} initial={false} transition={{ duration: reduced ? 0 : .6, ease }} /></div><small>Pet poglavlja. Cijela slika.</small></div>
        <div className="story-control-buttons"><button aria-label="Prethodno poglavlje" disabled={chapter === 0} onClick={() => go(chapter - 1)}><ArrowLeft size={18} /></button><button className="story-next" onClick={() => go(chapter === 4 ? 0 : chapter + 1)}><span>{chapter === 4 ? "Na početak" : "Dalje"}</span><ArrowRight size={18} /></button></div>
      </footer>
    </section>

    <div className="story-insight"><CircleHelp size={17} /><p><strong>Kako čitati prikaz</strong>{note}</p></div>

    <section className="story-explore" aria-labelledby="story-explore-title">
      <div className="story-explore-heading"><div><p className="eyebrow">VAŠ SLJEDEĆI KORAK</p><h2 id="story-explore-title">Iza brojki, još više priče.</h2></div><span>Od pregleda do izvornog podatka.</span></div>
      <div className="story-explore-links">{[
        { to: "/programska", title: "Programi i projekti", text: "Pratite sredstva do pojedine aktivnosti.", icon: GitBranch },
        { to: "/organizacijska", title: "Upravna tijela", text: "Pogledajte tko upravlja sredstvima.", icon: Building2 },
        { to: "/preuzimanja", title: "Izvorni dokumenti", text: "Pronađite podatke i njihova obrazloženja.", icon: BookOpen },
      ].map((item, index) => <motion.div key={item.to} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: reduced ? 0 : .5, delay: reduced ? 0 : index * .08, ease }}>
        <Link to={item.to}><div className="story-explore-top"><item.icon size={22} strokeWidth={1.4} /><span>0{index + 1}</span></div><h3>{item.title}</h3><p>{item.text}</p><ArrowUpRight className="story-explore-arrow" size={20} /></Link>
      </motion.div>)}</div>
    </section>
  </div>;
}

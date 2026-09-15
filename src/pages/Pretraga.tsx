import { useDeferredValue, useMemo } from "react";
import MiniSearch from "minisearch";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ExternalLink, ArrowRight, X } from "lucide-react";
import { useData } from "../lib/useData";
import type { SearchDoc } from "../lib/types";

const PDF_URL = `${import.meta.env.BASE_URL}izvornici/godisnji-izvjestaj-2025.pdf`;

const TYPE_LABEL: Record<string, string> = {
  programska: "Program / aktivnost",
  sekcija: "Obrazloženje",
};

export function Pretraga() {
  const { data: docs, loading } = useData<SearchDoc[]>("search-documents.json");
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const deferredQuery = useDeferredValue(q);
  const setQ = (value: string) => setParams(value ? {q:value} : {}, {replace:true});

  const index = useMemo(() => {
    if (!docs) return null;
    const mini = new MiniSearch<SearchDoc>({
      idField: "id",
      fields: ["naslov", "tekst"],
      storeFields: ["naslov", "tekst", "pdfPage", "tip", "sekcija", "programKod", "aktivnostKodovi", "razdjelKod"],
      searchOptions: { prefix: true, fuzzy: 0.2, boost: { naslov: 2 } },
    });
    mini.addAll(docs);
    return mini;
  }, [docs]);

  const allResults = useMemo(() => {
    if (!index || deferredQuery.trim().length < 2) return [];
    return index.search(deferredQuery) as unknown as (SearchDoc & { score: number })[];
  }, [index, deferredQuery]);
  const results = allResults.slice(0,40);

  const suggestions = ["vatrogasci", "cesta", "digitalizacija", "stipendije", "bolnica", "vrtić"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Pretraživanje izvještaja</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Pretraži tekst obrazloženja iz cijelog izvještaja — po programima, aktivnostima,
          prihodima, rashodima i investicijama.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          aria-label="Pojam za pretraživanje"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pretraži npr. 'vatrogasci', 'cesta', 'digitalizacija', 'stipendije'…"
          className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-9 text-sm shadow-sm transition focus:border-iz-blue-400 focus:outline-none focus:ring-2 focus:ring-iz-blue-100"
        />
        {q && (
          <button
            aria-label="Očisti pretragu"
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {!q && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setQ(s)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-iz-blue-300 hover:bg-iz-blue-50 hover:text-iz-blue-700"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {loading && <p className="text-sm text-slate-400">Učitavam indeks za pretragu…</p>}
      {!loading && q.trim().length >= 2 && (
        <p className="text-xs text-slate-400">{allResults.length} rezultata{allResults.length > 40 ? " · prikazano prvih 40" : ""} za „{q}"</p>
      )}

      {!loading && q.trim().length >= 2 && results.length === 0 && <p className="dashboard-panel text-slate-500">Nema rezultata. Pokušajte s drugom riječi ili kraćim pojmom.</p>}
      <div className="grid gap-3">
        <AnimatePresence>
          {results.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, delay: Math.min(i, 10) * 0.02 }}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {TYPE_LABEL[r.tip] ?? r.tip}
                  </span>
                  <p className="text-sm font-semibold text-slate-700">{r.naslov}</p>
                </div>
                {r.tip === "programska" && r.razdjelKod && r.programKod && (
                  <Link
                    to={`/programska?razdjel=${r.razdjelKod}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md bg-iz-blue-50 px-2 py-1 text-xs font-medium text-iz-blue-700 transition hover:bg-iz-blue-100"
                  >
                    Programi razdjela <ArrowRight size={11} />
                  </Link>
                )}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{highlight(snippet(r.tekst, q), q)}</p>
              <a
                href={`${PDF_URL}#page=${r.pdfPage}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-iz-blue-600 hover:underline"
              >
                Vidi u izvorniku (str. {r.pdfPage}) <ExternalLink size={11} />
              </a>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function snippet(text: string, q: string, radius = 160): string {
  if (text.length <= radius * 2) return text;
  const word = q.trim().split(/\s+/)[0]?.toLowerCase();
  const idx = word ? text.toLowerCase().indexOf(word) : -1;
  if (idx < 0) return text.slice(0, radius * 2) + "…";
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + radius);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

function highlight(text: string, q: string) {
  if (!q.trim()) return text;
  const words = q.trim().split(/\s+/).filter(Boolean);
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(re);
  return parts.map((p, i) => (words.some((w) => w.toLowerCase() === p.toLowerCase()) ? <mark key={i} className="rounded bg-iz-gold-400/60 px-0.5">{p}</mark> : p));
}

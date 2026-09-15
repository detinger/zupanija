import { CapitalProjects } from "../components/CapitalProjects";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, ExternalLink, ChevronDown } from "lucide-react";
import { useData } from "../lib/useData";
import type { NarrativeSections } from "../lib/types";
import { downloadCsv } from "../lib/exportView";
import { PageSkeleton } from "../components/Skeleton";

const PDF_URL = `${import.meta.env.BASE_URL}izvornici/godisnji-izvjestaj-2025.pdf`;

export function Investicije() {
  const { data: sections, loading } = useData<NarrativeSections>("narrative-sections.json");
  const [query, setQuery] = useState("");

  if (loading || !sections) {
    return <PageSkeleton />;
  }

  const investicije = sections["investicije"];
  const namjenska = sections["namjenska-sredstva"];
  const q = query.trim().toLowerCase();
  const odlomci = (investicije?.odlomci ?? []).filter((p) => !q || p.tekst.toLowerCase().includes(q));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Investicije Istarske županije u 2025.</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Kapitalna ulaganja Istarske županije opisana u obrazloženju godišnjeg izvještaja —
            zdravstvo, obrazovanje, promet, komunalna infrastruktura i druga ulaganja.
          </p>
        </div>
        <button
          onClick={() =>
            downloadCsv(
              "investicije-2025.csv",
              odlomci.map((p) => ({ tekst: p.tekst, "pdf str.": p.pdfPage }))
            )
          }
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-iz-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-iz-blue-700 active:scale-95"
        >
          <Download size={14} /> Obrazloženje (CSV)
        </button>
      </div>

      <CapitalProjects />
      <details className="be-raw-data">
      <summary>Obrazloženje investicija i namjenska sredstva</summary>
      <div className="relative mt-4 max-w-md">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          aria-label="Filtriraj obrazloženje investicija"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filtriraj odlomke (npr. 'bolnica', 'cesta', 'škola')…"
          className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm transition focus:border-iz-blue-400 focus:outline-none focus:ring-2 focus:ring-iz-blue-100"
        />
      </div>

      <div className="grid gap-3">
        {odlomci.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.03 }}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-sm leading-relaxed text-slate-700">{p.tekst}</p>
            <a
              href={`${PDF_URL}#page=${p.pdfPage}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-iz-blue-600 hover:underline"
            >
              Vidi u izvorniku (str. {p.pdfPage}) <ExternalLink size={11} />
            </a>
          </motion.div>
        ))}
        {odlomci.length === 0 && <p className="text-sm text-slate-400">Nema odlomaka za zadani filtar.</p>}
      </div>

      {namjenska && (
        <details className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-700">
            Namjenska sredstva koja se prenose u 2026. godinu ({namjenska.odlomci.length} odlomaka)
            <ChevronDown size={16} className="text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="mt-3 space-y-3">
            {namjenska.odlomci.map((p, i) => (
              <div key={i} className="text-sm leading-relaxed text-slate-600">
                <p>{p.tekst}</p>
                <a
                  href={`${PDF_URL}#page=${p.pdfPage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-iz-blue-600 hover:underline"
                >
                  str. {p.pdfPage} <ExternalLink size={11} />
                </a>
              </div>
            ))}
          </div>
        </details>
      )}
      </details>
    </div>
  );
}

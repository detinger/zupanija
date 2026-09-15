import { FileText, FileSpreadsheet, File, Download, Info } from "lucide-react";

const BASE = import.meta.env.BASE_URL;

const FILES = [
  {
    naziv: "Godišnji izvještaj o izvršenju Proračuna 2025. (PDF)",
    opis: "Cjeloviti službeni dokument — opći i poseban dio te obrazloženje, 1.048 stranica.",
    href: `${BASE}izvornici/godisnji-izvjestaj-2025.pdf`,
    velicina: "13 MB",
    icon: FileText,
    color: "text-red-500 bg-red-50",
  },
  {
    naziv: "Opći i posebni dio proračuna (XLSX)",
    opis: "Izvorna radna tablica sa svih 8 klasifikacija (ekonomska, funkcijska, organizacijska, programska…).",
    href: `${BASE}izvornici/OPCI-I-POSEBNI-DIO.xlsx`,
    velicina: "1.9 MB",
    icon: FileSpreadsheet,
    color: "text-iz-green-600 bg-iz-green-50",
  },
  {
    naziv: "Obrazloženje godišnjeg izvještaja (DOC)",
    opis: "Izvorni Word dokument s tekstualnim obrazloženjima (izvor za PDF objavu).",
    href: `${BASE}izvornici/Obrazlozenje-Godisnjeg-izvjestaja-2025.doc`,
    velicina: "5.4 MB",
    icon: File,
    color: "text-iz-blue-600 bg-iz-blue-50",
  },
];

export function Preuzimanja() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Preuzimanja</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Ovdje možete preuzeti cjeloviti izvorni Godišnji izvještaj o izvršenju Proračuna
          Istarske županije za 2025. godinu u izvornim formatima. Za preuzimanje samo trenutno
          prikazanog dijela podataka koristite gumb <em>„Preuzmi prikazano"</em> koji se nalazi na
          svakoj stranici s vizualizacijom.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {FILES.map((f) => (
          <a
            key={f.href}
            href={f.href}
            download
            className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-iz-blue-300 hover:shadow-lg"
          >
            <div className={`inline-flex w-fit rounded-lg p-2.5 ${f.color}`}>
              <f.icon size={20} />
            </div>
            <p className="mt-3 font-semibold text-slate-800 group-hover:text-iz-blue-700">{f.naziv}</p>
            <p className="mt-1 flex-1 text-sm text-slate-500">{f.opis}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-iz-blue-600">
              <Download size={13} /> Preuzmi · {f.velicina}
            </p>
          </a>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
        <Info size={16} className="mt-0.5 shrink-0 text-slate-400" />
        <div>
          <p className="font-medium text-slate-700">O izvoru podataka</p>
          <p className="mt-1.5">
            Ova stranica prikazuje podatke izdvojene iz izvornog izvještaja i povezuje ih s
            odgovarajućim tekstom obrazloženja radi lakšeg razumijevanja. Nije službena stranica
            Istarske županije, a za sve pravno mjerodavne podatke vrijedi isključivo izvorni PDF
            dokument usvojen na Skupštini Istarske županije.
          </p>
        </div>
      </div>
    </div>
  );
}

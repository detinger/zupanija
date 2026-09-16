import { motion } from "framer-motion";
import { FileText, ExternalLink, Info } from "lucide-react";
import type { NarrativeParagraph } from "../lib/types";

const PDF_URL = `${import.meta.env.BASE_URL}izvornici/godisnji-izvjestaj-2025.pdf`;

export function NarrativePanel({
  title,
  paragraphs,
  emptyHint,
}: {
  title: string;
  paragraphs: NarrativeParagraph[] | undefined;
  emptyHint?: string;
}) {
  if (!paragraphs || paragraphs.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
        <Info size={16} className="mt-0.5 shrink-0 text-slate-400" />
        <div>
          <p className="font-medium text-slate-600">{title}</p>
          <p className="mt-1">
            {emptyHint ??
              "Za ovu stavku nije pronađen izravan odgovarajući tekst obrazloženja u izvještaju."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-iz-green-500/25 bg-iz-green-50/50 p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-iz-green-800">
        <FileText size={15} /> {title}
      </p>
      <div className="mt-2 space-y-3">
        {paragraphs.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.03 }}
            className="text-sm leading-relaxed text-slate-700"
          >
            <p>{p.tekst}</p>
            <a
              href={`${PDF_URL}#page=${p.pdfPage}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-iz-blue-600 hover:underline"
            >
              Vidi u izvorniku (str. {p.pdfPage}) <ExternalLink size={11} />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

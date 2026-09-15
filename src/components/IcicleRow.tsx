import { useMemo, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import { fmtEur, fmtEurCompact } from "../lib/format";

export interface IcicleSegment {
  id: string;
  label: string;
  value: number;
  sublabel?: string;
}

const PALETTE = ["#0094d3", "#009a37", "#075c85", "#1cb15c", "#0b3550", "#4dc57c", "#52c2f0", "#8dd9a8"];

export function IcicleRow({
  rowLabel,
  segments,
  selectedId,
  onSelect,
}: {
  rowLabel: string;
  segments: IcicleSegment[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}) {
  const width = 1000;
  const height = 46;
  const [hover, setHover] = useState<{ seg: IcicleSegment; x: number } | null>(null);

  const total = useMemo(() => d3.sum(segments, (s) => s.value) || 1, [segments]);
  const x = useMemo(() => {
    return segments.map((s, i) => {
      const x0 = segments.slice(0, i).reduce((total, item) => total + item.value, 0);
      return { ...s, x0, x1: x0 + s.value };
    });
  }, [segments]);
  const scale = useMemo(() => d3.scaleLinear().domain([0, total]).range([0, width]), [total]);

  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-3">
        <span className="w-28 shrink-0 text-xs font-medium text-slate-400">{rowLabel}</span>
        <div className="flex h-[46px] flex-1 items-center rounded-md border border-dashed border-slate-200 px-3 text-xs text-slate-300">
          nema stavki
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-start gap-3">
      <span className="mt-4 w-28 shrink-0 text-xs font-medium text-slate-400">{rowLabel}</span>
      <div className="min-w-0 flex-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height={height}
          className="overflow-visible"
          onMouseLeave={() => setHover(null)}
        >
          {x.map((s, i) => {
            const w = Math.max(scale(s.x1) - scale(s.x0), 0.6);
            const active = selectedId === s.id;
            const tooNarrow = w < 34;
            return (
              <motion.g
                key={s.id}
                initial={false}
                animate={{ x: scale(s.x0) }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                onClick={() => onSelect(s.id)}
                onMouseEnter={() => setHover({ seg: s, x: scale(s.x0) + w / 2 })}
                className="cursor-pointer"
              >
                <motion.rect
                  initial={false}
                  animate={{
                    width: w,
                    opacity: active ? 1 : selectedId ? 0.4 : 0.85,
                  }}
                  whileHover={{ opacity: 1, filter: "brightness(1.08)" }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  height={height}
                  fill={PALETTE[i % PALETTE.length]}
                  stroke={active ? "#0b3550" : "white"}
                  strokeWidth={active ? 2 : 1}
                  rx={3}
                />
                {!tooNarrow && (
                  <text x={6} y={17} fontSize={10.5} fill="white" fontWeight={active ? 700 : 500} className="pointer-events-none select-none">
                    {s.label.length > w / 6 ? s.label.slice(0, Math.max(4, Math.floor(w / 6))) + "…" : s.label}
                  </text>
                )}
                {!tooNarrow && (
                  <text x={6} y={31} fontSize={9.5} fill="white" opacity={0.85} className="tabular pointer-events-none select-none">
                    {fmtEurCompact(s.value)}
                  </text>
                )}
              </motion.g>
            );
          })}
        </svg>
      </div>

      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{ left: `calc(7rem + ${(hover.x / width) * 100}%)` }}
            className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
          >
            <p className="font-semibold">{hover.seg.label}</p>
            {hover.seg.sublabel && <p className="text-slate-300">{hover.seg.sublabel}</p>}
            <p className="tabular text-iz-gold-400">{fmtEur(hover.seg.value)}</p>
            <p className="text-slate-400">{((hover.seg.value / total) * 100).toFixed(1)}% od prikaza</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

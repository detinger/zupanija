import { useMemo, useState } from "react";
import { useData } from "../lib/useData";
import type { FlatRow, NarrativeSections } from "../lib/types";
import { DataTable } from "../components/DataTable";
import { BarChart } from "../components/BarChart";
import { NarrativePanel } from "../components/NarrativePanel";
import { PageSkeleton } from "../components/Skeleton";

export function KlasifikacijaPage({
  dataPath,
  title,
  description,
  topLevel,
  narrativeSectionKeys,
  exportName,
}: {
  dataPath: string;
  title: string;
  description: string;
  topLevel: number;
  narrativeSectionKeys?: string[];
  exportName: string;
}) {
  const { data: rows, loading } = useData<FlatRow[]>(dataPath);
  const { data: sections } = useData<NarrativeSections>("narrative-sections.json");
  const [selected, setSelected] = useState<string | null>(null);

  const chartData = useMemo(() => {
    if (!rows) return [];
    return rows
      .filter((r) => r.razina === topLevel && (r.izvrsenje2025 ?? 0) > 0)
      .sort((a, b) => (b.izvrsenje2025 ?? 0) - (a.izvrsenje2025 ?? 0))
      .slice(0, 12)
      .map((r) => ({ key: r.kod ?? r.opis, label: r.opis, plan: r.tekuciPlan2025 ?? 0, izvrsenje: r.izvrsenje2025 ?? 0 }));
  }, [rows, topLevel]);

  const narrativeParagraphs = useMemo(() => {
    if (!sections || !narrativeSectionKeys) return [];
    return narrativeSectionKeys.flatMap((k) => sections[k]?.odlomci ?? []);
  }, [sections, narrativeSectionKeys]);

  if (loading || !rows) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Najveće stavke po izvršenju</h2>
          <div className="mt-4">
            <BarChart data={chartData} onSelect={setSelected} selectedKey={selected} exportName={exportName} />
          </div>
        </div>
        <div className="max-h-[560px] overflow-auto">
          <NarrativePanel
            title="Obrazloženje iz izvještaja"
            paragraphs={narrativeParagraphs.slice(0, 30)}
            emptyHint="Za ovu kategoriju obrazloženje nije zasebno strukturirano."
          />
        </div>
      </div>

      <DataTable rows={rows} onSelect={(r) => setSelected(r.kod)} selectedKod={selected} exportName={exportName} />
    </div>
  );
}

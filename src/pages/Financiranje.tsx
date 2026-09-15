import { useMemo, useState } from "react";
import { useData } from "../lib/useData";
import type { FinanciranjeIzvoriRow, FlatRow } from "../lib/types";
import { DataTable } from "../components/DataTable";
import { BarChart } from "../components/BarChart";
import { PageSkeleton } from "../components/Skeleton";
import { fmtEur, fmtPct } from "../lib/format";

export function Financiranje() {
  const { data: ekon, loading: l1 } = useData<FlatRow[]>("financiranje-ekonomska.json");
  const { data: izvori, loading: l2 } = useData<FinanciranjeIzvoriRow[]>("financiranje-izvori.json");
  const [selected, setSelected] = useState<string | null>(null);

  const chartData = useMemo(() => {
    if (!ekon) return [];
    return ekon
      .filter((r) => r.razina === 1)
      .map((r) => ({ key: r.kod ?? r.opis, label: r.opis, plan: r.tekuciPlan2025 ?? 0, izvrsenje: r.izvrsenje2025 ?? 0 }));
  }, [ekon]);

  const primici = izvori?.filter((r) => r.sekcija === "primici" && r.razina <= 1) ?? [];
  const izdaci = izvori?.filter((r) => r.sekcija === "izdaci" && r.razina <= 1) ?? [];

  if (l1 || l2 || !ekon) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Račun financiranja</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          B. Račun financiranja — primici od financijske imovine i zaduživanja te izdaci za
          financijsku imovinu i otplate zajmova, prema ekonomskoj klasifikaciji i izvorima
          financiranja.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Primici i izdaci — plan naspram izvršenja</h2>
        <div className="mt-4">
          <BarChart data={chartData} onSelect={setSelected} selectedKey={selected} exportName="racun-financiranja" />
        </div>
      </div>

      <DataTable rows={ekon} onSelect={(r) => setSelected(r.kod)} selectedKod={selected} exportName="financiranje-ekonomska" />

      <div className="grid gap-6 sm:grid-cols-2">
        <IzvoriTable title="Primici prema izvorima financiranja" rows={primici} />
        <IzvoriTable title="Izdaci prema izvorima financiranja" rows={izdaci} />
      </div>
    </div>
  );
}

function IzvoriTable({ title, rows }: { title: string; rows: FinanciranjeIzvoriRow[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <p className="border-b border-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700">{title}</p>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-slate-100 transition-colors hover:bg-iz-blue-50/50">
              <td className="px-4 py-1.5 text-slate-600">{r.opis}</td>
              <td className="tabular px-3 py-1.5 text-right font-medium text-slate-800">{fmtEur(r.izvrsenje2025)}</td>
              <td className="tabular px-3 py-1.5 text-right text-slate-400">{fmtPct(r.indeks43)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

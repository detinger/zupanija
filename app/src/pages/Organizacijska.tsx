import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../lib/useData";
import type { OrganizacijskaRow, FlatRow } from "../lib/types";
import { DataTable } from "../components/DataTable";
import { BarChart } from "../components/BarChart";
import { PageSkeleton } from "../components/Skeleton";

export function Organizacijska() {
  const { data: org, loading } = useData<OrganizacijskaRow[]>("organizacijska.json");
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  const rows: FlatRow[] = useMemo(
    () =>
      (org ?? []).map((r) => ({
        kod: r.kod,
        opis: r.opis,
        izvrsenje2024: null,
        izvorniPlan2025: r.izvorniPlan2025,
        tekuciPlan2025: r.tekuciPlan2025,
        izvrsenje2025: r.izvrsenje2025,
        indeks41: null,
        indeks43: r.indeks,
        razina: r.tip === "Razdjel" ? 1 : 2,
      })),
    [org]
  );

  const chartData = useMemo(
    () =>
      rows
        .filter((r) => r.razina === 1)
        .sort((a, b) => (b.izvrsenje2025 ?? 0) - (a.izvrsenje2025 ?? 0))
        .map((r) => ({ key: r.kod ?? r.opis, label: r.opis, plan: r.tekuciPlan2025 ?? 0, izvrsenje: r.izvrsenje2025 ?? 0 })),
    [rows]
  );

  if (loading || !org) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-800">Izvršenje po organizacijskoj klasifikaciji</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">
          Rashodi i izdaci prema upravnim tijelima Istarske županije (razdjeli i glave). Klikom na
          razdjel otvara se pregled njegovih programa i aktivnosti.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Razdjeli — plan naspram izvršenja</h2>
        <div className="mt-4">
          <BarChart
            data={chartData}
            selectedKey={selected}
            onSelect={(k) => {
              setSelected(k);
              navigate(`/programska?razdjel=${k}`);
            }}
            exportName="organizacijska-razdjeli"
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">Klikni na stavku za detaljan pregled programa tog razdjela.</p>
      </div>

      <DataTable
        rows={rows}
        onSelect={(r) => r.razina === 1 && navigate(`/programska?razdjel=${r.kod}`)}
        selectedKod={selected}
        exportName="organizacijska-klasifikacija"
      />
    </div>
  );
}

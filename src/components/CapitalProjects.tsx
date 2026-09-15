import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Download, Search } from "lucide-react";
import type { Razdjel } from "../lib/types";
import { useData } from "../lib/useData";
import { projectRecords } from "../lib/programTree";
import { fmtEurCompact, fmtPct } from "../lib/format";
import { downloadCsv } from "../lib/exportView";
import { KpiCard } from "./KpiCard";
export function CapitalProjects() {
  const {data}=useData<Razdjel[]>("programska.json");
  const [query,setQuery]=useState("");
  const [department,setDepartment]=useState("");
  const [limit,setLimit]=useState(20);
  const all=useMemo(()=>projectRecords(data??[]).filter(r=>r.activity.tip==='Kapitalni projekt'),[data]);
  const q=query.trim().toLocaleLowerCase('hr');
  const filtered=all.filter(r=>(!department||r.departmentCode===department)&&(!q||`${r.activity.naziv} ${r.activity.kod} ${r.owner}`.toLocaleLowerCase('hr').includes(q))).sort((a,b)=>(b.activity.izvrsenje2025??0)-(a.activity.izvrsenje2025??0));
  const plan=filtered.reduce((s,r)=>s+(r.activity.tekuciPlan2025??0),0);
  const actual=filtered.reduce((s,r)=>s+(r.activity.izvrsenje2025??0),0);
  return <section className="space-y-4" aria-label="Kapitalni projekti iz proračuna">
    <div className="grid gap-3 sm:grid-cols-3"><KpiCard label="Kapitalni projekti u odabiru" value={String(filtered.length)} sub="Prema programskoj klasifikaciji"/><KpiCard label="Izvršenje odabranih projekata" value={fmtEurCompact(actual)} accent="green"/><KpiCard label="Izvršenje plana" value={fmtPct(plan?actual/plan*100:null)} sub={`Tekući plan: ${fmtEurCompact(plan)}`}/></div>
    <div className="dashboard-panel"><div className="program-toolbar"><div><h2 className="text-lg font-semibold">Kapitalni projekti</h2><p className="text-sm text-slate-500">Stvarni iznosi iz programske klasifikacije</p></div><button className="chart-download" onClick={()=>downloadCsv('kapitalni-projekti-2025.csv',filtered.map(r=>({sifra:r.activity.kod,naziv:r.activity.naziv,ustanova:r.owner,razdjel:r.department,plan:r.activity.tekuciPlan2025,izvrsenje:r.activity.izvrsenje2025})))}><Download size={14}/> Izvoz CSV</button></div>
      <div className="program-toolbar"><label className="program-search"><Search size={16}/><input aria-label="Pretraži kapitalne projekte" placeholder="Naziv, ustanova ili šifra…" value={query} onChange={e=>{setQuery(e.target.value);setLimit(20);}}/></label><select className="max-w-full" aria-label="Filtriraj projekte po razdjelu" value={department} onChange={e=>{setDepartment(e.target.value);setLimit(20);}}><option value="">Svi razdjeli</option>{data?.filter(r=>all.some(p=>p.departmentCode===r.kod)).map(r=><option value={r.kod} key={r.kod}>{r.naziv}</option>)}</select></div>
      <div>{filtered.slice(0,limit).map(r=><Link className="program-item" to={r.url} key={r.url}><span className="program-code">{r.activity.kod}</span><span className="program-item-name"><strong>{r.activity.naziv}</strong><small>{r.owner}</small></span><span className="program-item-value"><strong>{fmtEurCompact(r.activity.izvrsenje2025)}</strong><small>{fmtPct(r.activity.tekuciPlan2025?(r.activity.izvrsenje2025??0)/r.activity.tekuciPlan2025*100:null)} plana</small></span><ArrowUpRight size={17}/></Link>)}</div>
      {!filtered.length&&<p className="py-6 text-slate-500">Nema projekata za odabrane filtre.</p>}
      {filtered.length>limit&&<button className="chart-download mt-4" onClick={()=>setLimit(n=>n+20)}>Prikaži još ({filtered.length-limit})</button>}
      <p className="mt-4 text-xs text-slate-500">Ovdje su projekti označeni kao kapitalni u programskoj klasifikaciji. Njihovi rashodi mogu obuhvaćati više ekonomskih konta; ovaj zbroj nije jednak ukupnoj nabavi nefinancijske imovine.</p>
    </div>
  </section>;
}

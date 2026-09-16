import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronRight, Download, Home, Search, ArrowLeft, FileText } from "lucide-react";
import { useData } from "../lib/useData";
import type { Razdjel, NarrativeProgramskaIndex, Totals } from "../lib/types";
import { programsInHead } from "../lib/programTree";
import { NarrativePanel } from "../components/NarrativePanel";
import { KpiCard } from "../components/KpiCard";
import { PageSkeleton } from "../components/Skeleton";
import { fmtEur, fmtEurCompact, fmtPct } from "../lib/format";
import { downloadCsv, downloadJson } from "../lib/exportView";
function index(value: string|null, length: number): number|undefined { if(value===null)return undefined; const n=Number(value); return Number.isInteger(n)&&n>=0&&n<length?n:undefined; }
interface Item extends Totals { naziv:string; kod:string; owner?:string; index:number }
export function Programska() {
  const {data:departments,loading}=useData<Razdjel[]>("programska.json");
  const {data:narrative}=useData<NarrativeProgramskaIndex>("narrative-programska.json");
  const [params,setParams]=useSearchParams();
  const [queryState,setQuery]=useState({path:"",value:""});
  const [sort,setSort]=useState("amount");
  const ri=params.has('razdjel') ? departments?.findIndex(r=>r.kod===params.get('razdjel')) : index(params.get('r'),departments?.length??0);
  const r=ri!==undefined&&ri>=0?departments?.[ri]:undefined;
  const gi=index(params.get('g'),r?.glave.length??0);
  const g=gi!==undefined?r?.glave[gi]:undefined;
  const programs=useMemo(()=>programsInHead(g),[g]);
  const pi=index(params.get('p'),programs.length);
  const entry=pi!==undefined?programs[pi]:undefined;
  const p=entry?.program;
  const ai=index(params.get('a'),p?.aktivnosti.length??0);
  const a=ai!==undefined?p?.aktivnosti[ai]:undefined;
  const path=params.toString();
  const query=queryState.path===path?queryState.value:"";
  function navigate(level:number,selectedIndex?:number) {
    const ids=[ri,gi,pi,ai];
    if(selectedIndex!==undefined)ids[level]=selectedIndex;
    const next=new URLSearchParams();
    ['r','g','p','a'].forEach((key,i)=>{if(i<=level&&ids[i]!==undefined&&ids[i]!>=0)next.set(key,String(ids[i]));});
    setParams(next,{preventScrollReset:true});
  }
  if(loading||!departments)return <PageSkeleton/>;
  const total:Totals=departments.reduce((s,r)=>({tekuciPlan2025:(s.tekuciPlan2025??0)+(r.tekuciPlan2025??0),izvrsenje2025:(s.izvrsenje2025??0)+(r.izvrsenje2025??0),izvorniPlan2025:null,indeks:null}),{tekuciPlan2025:0,izvrsenje2025:0,izvorniPlan2025:null,indeks:null});
  const current=a??p??g??r??total;
  const title=a?.naziv??p?.naziv??g?.naziv??r?.naziv??"Svi programi proračuna";
  const level=p?3:g?2:r?1:0;
  const items:Item[]=p?p.aktivnosti.map((item,index)=>({...item,index})):
    g?programs.map(({program,owner},index)=>({...program,owner,index})):
    r?r.glave.map((item,index)=>({...item,index})):departments.map((item,index)=>({...item,index}));
  const q=query.trim().toLocaleLowerCase('hr');
  const visible=items.filter(item=>!q||`${item.kod} ${item.naziv} ${item.owner??''}`.toLocaleLowerCase('hr').includes(q)).sort((x,y)=>sort==='name'?x.naziv.localeCompare(y.naziv,'hr'):(y.izvrsenje2025??0)-(x.izvrsenje2025??0));
  const max=Math.max(1,...items.map(item=>item.izvrsenje2025??0));
  const paragraphs=(a&&p&&r&&narrative?.poAktivnosti[`${r.kod}|${p.kod}|${a.kod}`])||(p&&r&&narrative?.poPrograma[`${r.kod}|${p.kod}`])||[];
  const exportRows=a?a.stavke.map(s=>({konto:s.konto,naziv:s.opis,izvrsenje2025:s.izvrsenje2025})):visible.map(item=>({sifra:item.kod,naziv:item.naziv,ustanova:item.owner??'',tekuciPlan2025:item.tekuciPlan2025,izvrsenje2025:item.izvrsenje2025}));
  return <div className="space-y-6">
    <header className="home-heading"><div><p className="eyebrow">Od cjeline do detalja</p><h1>Programi i projekti</h1><p>Odaberite upravno tijelo, program i aktivnost. Svaki korak otkriva detaljniju raspodjelu sredstava.</p></div><button className="primary-link" onClick={()=>downloadCsv('programska-prikaz.csv',exportRows)}><Download size={16}/> Preuzmi podatke</button></header>
    <nav className="program-breadcrumb" aria-label="Putanja unutar proračuna"><button onClick={()=>navigate(-1)}><Home size={15}/> Svi razdjeli</button>{[{item:r,level:0},{item:g,level:1},{item:p,level:2},{item:a,level:3}].map(({item,level})=>item&&<span key={level}><ChevronRight size={14}/><button title={item.naziv} onClick={()=>navigate(level)}>{item.naziv}</button></span>)}</nav>
    <div><p className="eyebrow">{a?a.tip:p?'Program':g?'Glava':r?'Razdjel':'Cijeli proračun'}</p><h2 className="text-xl font-semibold text-slate-800">{title}</h2>{entry&&<p className="mt-1 text-sm text-slate-500">{entry.owner}</p>}</div>
    <div className="grid gap-3 sm:grid-cols-3"><KpiCard label="Tekući plan 2025." value={fmtEurCompact(current.tekuciPlan2025)}/><KpiCard label="Izvršenje 2025." value={fmtEurCompact(current.izvrsenje2025)} accent="green"/><KpiCard label="Izvršenje plana" value={fmtPct(current.tekuciPlan2025?(current.izvrsenje2025??0)/current.tekuciPlan2025*100:null)} accent="gold"/></div>
    {!a?<section className="dashboard-panel">
      <div className="program-toolbar"><div><h2 className="text-lg font-semibold">{['Upravna tijela','Glave i ustanove','Programi','Aktivnosti i projekti'][level]}</h2><p className="text-sm text-slate-500">{visible.length} od {items.length} stavki · odaberite redak za detalje</p></div>
        <label className="program-search"><Search size={16}/><input aria-label="Filtriraj prikazane programe" value={query} onChange={e=>setQuery({path,value:e.target.value})} placeholder="Naziv ili šifra…"/></label>
        <select aria-label="Poredak programa" value={sort} onChange={e=>setSort(e.target.value)}><option value="amount">Najveći iznos</option><option value="name">Naziv A–Ž</option></select>
      </div>
      <div className="program-list">{visible.map(item=><button className="program-item" key={`${item.kod}-${item.index}`} onClick={()=>navigate(level,item.index)}><span className="program-code">{item.kod}</span><span className="program-item-name"><strong>{item.naziv}</strong>{item.owner&&<small>{item.owner}</small>}<span className="program-track" aria-hidden="true"><i style={{width:`${Math.max(0,item.izvrsenje2025??0)/max*100}%`}}/></span></span><span className="program-item-value"><strong>{fmtEurCompact(item.izvrsenje2025)}</strong><small>{fmtPct(item.tekuciPlan2025?(item.izvrsenje2025??0)/item.tekuciPlan2025*100:null)} plana</small></span><ChevronRight size={17}/></button>)}{!visible.length&&<p className="py-8 text-slate-500">Nema stavki za ovaj filtar. Pokušajte s kraćim nazivom ili šifrom.</p>}</div>
    </section>:<section className="dashboard-panel"><div className="panel-heading"><h2>Rashodi po ekonomskim kontima</h2><button className="text-sm text-iz-blue-700" onClick={()=>navigate(2)}><ArrowLeft size={14} className="mr-1 inline"/> Sve aktivnosti</button></div><div className="overflow-auto"><table className="w-full min-w-[440px] text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-3">Konto</th><th>Naziv</th><th className="text-right">Izvršenje 2025.</th></tr></thead><tbody>{a.stavke.map((s,i)=><tr className="border-b border-slate-100" key={i}><td className="py-3 pr-3 text-slate-500">{s.konto}</td><td className="py-3 pr-4">{s.opis}</td><td className="whitespace-nowrap py-3 text-right font-semibold">{fmtEur(s.izvrsenje2025)}</td></tr>)}</tbody></table></div></section>}
    {p&&<section><div className="mb-3 flex flex-wrap justify-between gap-2"><h2 className="text-lg font-semibold">Obrazloženje iz izvještaja</h2><button className="text-sm text-iz-blue-700" onClick={()=>downloadJson('programska-obrazlozenje.json',{naziv:title,obrazlozenje:paragraphs})}><FileText size={14} className="mr-1 inline"/> Preuzmi obrazloženje (JSON)</button></div><NarrativePanel title={title} paragraphs={paragraphs}/></section>}
    <p className="text-xs text-slate-500">Programska klasifikacija uključuje rashode i izdatke. Iznosi na različitim razinama hijerarhije se ne zbrajaju međusobno.</p>
  </div>;
}

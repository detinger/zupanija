import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { fmtEurExact, fmtEurCompact, fmtPct } from "../lib/format";
import { downloadSvgAsPng } from "../lib/exportView";
export interface BarDatum { key: string; label: string; plan: number; izvrsenje: number }
export function BarChart({data,onSelect,selectedKey,exportName="graf"}: {data:BarDatum[];height?:number;onSelect?:(key:string)=>void;selectedKey?:string|null;exportName?:string}) {
  const svgRef=useRef<SVGSVGElement>(null);
  const [message,setMessage]=useState("");
  const max=Math.max(1,...data.flatMap(d=>[d.plan,d.izvrsenje]));
  if (!data.length) return <p className="p-4 text-sm text-slate-500">Nema stavki za ovaj prikaz.</p>;
  return <div className="budget-bars">
    <div className="budget-bars-legend"><span><i style={{background:'#bdcbd7'}}/> Tekući plan</span><span><i style={{background:'#218b77'}}/> Izvršenje</span></div>
    <div className="budget-bars-list">{data.map(d=><button key={d.key} className="budget-bar-row" type="button" onClick={()=>onSelect?.(d.key)} aria-pressed={onSelect ? selectedKey===d.key : undefined} title={`Tekući plan: ${fmtEurExact(d.plan)}; izvršenje: ${fmtEurExact(d.izvrsenje)}; ${fmtPct(d.plan ? d.izvrsenje/d.plan*100:null)} plana`}>
      <span className="budget-bar-label"><span>{d.label.charAt(0)+d.label.slice(1).toLocaleLowerCase('hr')}</span><strong>{fmtEurCompact(d.izvrsenje)}</strong></span>
      <span className="budget-bar-tracks" aria-hidden="true"><i style={{width:`${Math.max(0,d.plan)/max*100}%`}}/><i style={{width:`${Math.max(0,d.izvrsenje)/max*100}%`}}/></span>
      <span className="budget-bar-meta">Plan {fmtEurCompact(d.plan)} <span>{fmtPct(d.plan ? d.izvrsenje/d.plan*100:null)} izvršeno</span></span>
    </button>)}</div>
    <div className="mt-4 flex flex-wrap items-center justify-end gap-2"><span role="status" className="text-sm text-slate-600">{message}</span><button className="chart-download" onClick={async()=>{if(!svgRef.current)return;try{await downloadSvgAsPng(svgRef.current,`${exportName}.png`);setMessage("");}catch{setMessage("Preuzimanje nije uspjelo. Pokušajte ponovno.");}}}><Download size={14}/> Preuzmi graf (PNG)</button></div>
    <svg ref={svgRef} viewBox={`0 0 800 ${data.length*80+60}`} width={800} height={data.length*80+60} aria-hidden="true" style={{position:'absolute',left:-10000,top:0,pointerEvents:'none'}}>
      <text x={20} y={25} fontSize={14} fill="#284b63">Tekući plan (sivo) · Izvršenje 2025. (zeleno) · Iznosi u EUR</text>
      {data.map((d,i)=><g key={d.key} transform={`translate(20,${i*80+55})`}><text y={0} fontSize={14} fill="#17394f">{d.label.length>74?d.label.slice(0,73)+'…':d.label}</text><rect y={12} height={10} width={Math.max(0,d.plan)/max*570} fill="#bdcbd7"/><rect y={26} height={10} width={Math.max(0,d.izvrsenje)/max*570} fill="#218b77"/><text x={590} y={33} fontSize={14} fill="#17394f">{fmtEurCompact(d.izvrsenje)}</text></g>)}
    </svg>
  </div>;
}

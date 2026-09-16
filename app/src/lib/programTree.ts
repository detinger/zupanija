import type { Razdjel, Program, Aktivnost } from "./types.ts";
export function programsInHead(head: Razdjel['glave'][number] | undefined): {program:Program;owner:string}[] {
  return head ? [...head.programi.map(program=>({program,owner:head.naziv})), ...head.korisnici.flatMap(owner=>owner.programi.map(program=>({program,owner:owner.naziv})))] : [];
}
export interface ProjectRecord { activity: Aktivnost; owner: string; department: string; departmentCode: string; program: string; url: string }
export function projectRecords(departments: Razdjel[]): ProjectRecord[] {
  return departments.flatMap((r,ri)=>r.glave.flatMap((g,gi)=>programsInHead(g).flatMap((p,pi)=>p.program.aktivnosti.map((activity,ai)=>({activity,owner:p.owner,department:r.naziv,departmentCode:r.kod,program:p.program.naziv,url:`/programska?r=${ri}&g=${gi}&p=${pi}&a=${ai}`})))));
}

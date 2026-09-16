export interface SazetakRow {
  kind: "section" | "row";
  label?: string;
  konto?: string | null;
  opis?: string | null;
  izvrsenje2024?: number | null;
  izvorniPlan2025?: number | null;
  tekuciPlan2025?: number | null;
  izvrsenje2025?: number | null;
  indeks41?: number | null;
  indeks42?: number | null;
}

export interface FlatRow {
  kod: string | null;
  opis: string;
  izvrsenje2024: number | null;
  izvorniPlan2025: number | null;
  tekuciPlan2025: number | null;
  izvrsenje2025: number | null;
  indeks41: number | null;
  indeks43: number | null;
  razina: number;
}

export interface FinanciranjeIzvoriRow extends FlatRow {
  sekcija: "primici" | "izdaci" | null;
}

export interface OrganizacijskaRow {
  tip: "Razdjel" | "Glava";
  kod: string;
  opis: string;
  izvorniPlan2025: number | null;
  tekuciPlan2025: number | null;
  izvrsenje2025: number | null;
  indeks: number | null;
}

export interface Totals {
  izvorniPlan2025: number | null;
  tekuciPlan2025: number | null;
  izvrsenje2025: number | null;
  indeks: number | null;
}

export interface Stavka {
  konto: string;
  opis: string;
  izvrsenje2025: number;
}

export interface Aktivnost extends Totals {
  kod: string;
  tip: "Aktivnost" | "Kapitalni projekt" | "Tekući projekt";
  naziv: string;
  stavke: Stavka[];
}

export interface Program extends Totals {
  kod: string;
  naziv: string;
  aktivnosti: Aktivnost[];
}

export interface ProrKorisnik extends Totals {
  id: string;
  naziv: string;
  programi: Program[];
}

export interface Glava extends Totals {
  kod: string;
  naziv: string;
  programi: Program[];
  korisnici: ProrKorisnik[];
}

export interface Razdjel extends Totals {
  kod: string;
  naziv: string;
  glave: Glava[];
}

export interface NarrativeParagraph {
  tekst: string;
  pdfPage: number;
}

export interface NarrativeProgramskaIndex {
  poPrograma: Record<string, NarrativeParagraph[]>;
  poAktivnosti: Record<string, NarrativeParagraph[]>;
}

export interface NarrativeSection {
  naslov: string;
  pdfPageStart: number;
  odlomci: NarrativeParagraph[];
}

export type NarrativeSections = Record<string, NarrativeSection>;

export interface SearchDoc {
  id: string;
  naslov: string;
  tekst: string;
  pdfPage: number;
  tip: "programska" | "sekcija";
  sekcija?: string;
  programKod?: string | null;
  aktivnostKodovi?: string[];
  razdjelKod?: string;
}

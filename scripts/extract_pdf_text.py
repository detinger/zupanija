#!/usr/bin/env python3
"""
Izvlači narativni tekst obrazloženja iz službenog PDF-a (1048 str.) i:
  1) spaja odlomke iz poglavlja 5.1 (obrazloženje po programskoj klasifikaciji,
     pdf str. 326-1002) sa čvorovima u programska.json (po Razdjelu + nazivu
     programa/aktivnosti),
  2) sprema veće fiksne cjeline (4.2 prihodi, 4.3 rashodi, investicije,
     namjenska sredstva, zaključak...) kao odlomke s referencom na stranicu,
  3) gradi flat popis dokumenata za client-side full-text pretragu.

Napomena: granice poglavlja (brojevi PDF stranica ispod) ručno su utvrđene
pretragom po naslovima jer je izvorni PDF fiksan, jednom objavljen dokument
koji se više neće mijenjati za 2025. godinu.

Pokretanje:  python3 scripts/extract_pdf_text.py   (nakon extract_xlsx.py)
Izlaz:       public/data/narrative-programska.json
             public/data/narrative-sections.json
             public/data/search-documents.json
"""
import json
import re
import subprocess
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_PDF = ROOT / "public" / "izvornici" / "godisnji-izvjestaj-2025.pdf"
PROGRAMSKA_JSON = ROOT / "public" / "data" / "programska.json"
OUT_DIR = ROOT / "public" / "data"

# pdf stranice (1-based, kako ih vraća pdftotext) - utvrđeno pretragom naslova
SEC_PROGRAMSKA = (326, 1002)         # 5.1 Obrazloženje izvršenja po programskoj klasifikaciji
FIXED_SECTIONS = [
    ("prihodi", "Obrazloženje prihoda i primitaka", 270, 310),
    ("rashodi-uprava", "Rashodi i izdaci upravnih tijela Istarske županije", 316, 320),
    ("rashodi-korisnici", "Rashodi i izdaci proračunskih korisnika", 321, 325),
    ("investicije", "Investicije Istarske županije u 2025. g.", 1004, 1015),
    ("namjenska-sredstva", "Namjenska sredstva koja se prenose u slijedeću godinu", 1016, 1021),
    ("zakljucak", "Zaključak", 1043, 1043),
]


def get_pdf_pages():
    print(f"Pokrećem pdftotext na {SRC_PDF} ...")
    out = subprocess.run(
        ["pdftotext", str(SRC_PDF), "-"], capture_output=True, check=True,
    ).stdout.decode("utf-8", errors="replace")
    return out.split("\f")


PUA_RE = re.compile(r"[-]")


def clean_text(text: str) -> str:
    """Ukloni artefakte fontova (privatna Unicode zona -> obična točka-crtica)."""
    return PUA_RE.sub("•", text)


def looks_like_prose(line: str) -> bool:
    """Odbaci retke koji su zapravo spojeni nazivi stavki tablice (SVE VELIKIM
    SLOVIMA, bez interpunkcije rečenice) umjesto stvarne proze."""
    letters = [c for c in line if c.isalpha()]
    if len(letters) < 15:
        return False
    lower_ratio = sum(1 for c in letters if c.islower()) / len(letters)
    return lower_ratio > 0.25


def normalize(name: str) -> str:
    name = name.strip().rstrip(".:,;")
    name = re.sub(r"\s+", " ", name)
    name = unicodedata.normalize("NFKC", name)
    return name.upper()


# ---------------------------------------------------------------------------
# 1) parsiranje poglavlja 5.1 u blokove (RAZDJEL / Program / Aktivnost)
# ---------------------------------------------------------------------------
RAZDJEL_HEAD = re.compile(r"^RAZDJEL\s+(\d+)\s*[–—-]\s*(.+)$")
PROGRAM_HEAD = re.compile(r"^\d+?\.?\s*NAZIV PROGRAMA\s*[:\-–—]\s*(.*)$", re.IGNORECASE)
AKT_HEAD_1 = re.compile(
    r"^\d*\.?\d*\.?\s*NAZIVI?\s+(AKTIVNOSTI|KAPITALNOG PROJEKTA|TEKUĆEG PROJEKTA)\s*[:\-–—]\s*(.*)$",
    re.IGNORECASE,
)
AKT_HEAD_2 = re.compile(r"^(Aktivnosti?)\s*:\s*(.+)$")
AKT_HEAD_3 = re.compile(r"^(Kapitalni|Tekući)\s+projekt\s*:\s*(.+)$", re.IGNORECASE)
AKT_PREFIX_BY_VRSTA = {
    "aktivnosti": "A", "aktivnost": "A",
    "kapitalnog projekta": "K", "kapitalni": "K",
    "tekućeg projekta": "T", "tekući": "T",
}
NOISE_LINE = re.compile(
    r"^(OBRAZLOŽENJE (AKTIVNOSTI|PROGRAMA|PROJEKTA)|RAZDJEL(?!\s+\d))\s*$", re.IGNORECASE
)
LEADING_CODE = re.compile(r"^([A-Z]?\d{3,6})\s+(.+)$")


def strip_leading_code(text: str):
    """'1101 PREVENCIJA U ZAŠTITI OKOLIŠA' -> ('1101', 'PREVENCIJA U ZAŠTITI OKOLIŠA')"""
    m = LEADING_CODE.match(text.strip())
    if m:
        return m.group(1), m.group(2).strip()
    return None, text.strip()


FULL_CODE_PIECE = re.compile(r"^([AKT]\d{6})\s+(.+)$")
SHORT_CODE_PIECE = re.compile(r"^(\d{3})\s+(.+)$")


def extract_akt_entries(raw: str, prefix_hint: str, program_kod_hint: str | None):
    """Vraća listu {kod, naziv} iz teksta zaglavlja aktivnosti/projekta.

    Podržava oba stila zapisa uočena u izvorniku:
      - puni kodovi razdvojeni ';': 'A110101 Zaštita i ...; A110105 Sanacija ...'
      - kratke sufiksne oznake uz already-known program kod, razdvojene ',' / ' i ':
        '001 Plaće zaposlenika, 002 ostala prava i 003 troškovi upravnog tijela'
    """
    if not raw:
        return []
    raw = raw.strip().rstrip(".")
    if not raw:
        return []

    semi_parts = [p.strip() for p in raw.split(";") if p.strip()]
    full_matches = [FULL_CODE_PIECE.match(p) for p in semi_parts]
    if semi_parts and all(full_matches):
        return [{"kod": m.group(1), "naziv": m.group(2).strip()} for m in full_matches]

    parts = re.split(r",|\s+i\s+(?=\d{3}\s)|\s+i\s+(?=[A-ZČĆŽŠĐ])", raw)
    entries = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        m = SHORT_CODE_PIECE.match(p)
        if m and program_kod_hint:
            suffix, naziv = m.group(1), m.group(2).strip()
            entries.append({"kod": f"{prefix_hint}{program_kod_hint}{suffix}", "naziv": naziv})
        elif m:
            entries.append({"kod": None, "naziv": m.group(2).strip()})
        else:
            entries.append({"kod": None, "naziv": p})
    return entries


def parse_programska_narrative(pages):
    blocks = []
    cur_razdjel_kod = None
    cur_razdjel_naziv = None
    cur_program_naziv = None
    cur_program_kod_hint = None
    cur_akt_entries = []
    buf = []

    def flush():
        text = clean_text(" ".join(buf).strip())
        text = re.sub(r"\s+", " ", text)
        buf.clear()
        if len(text) < 25:
            return
        blocks.append({
            "razdjelKod": cur_razdjel_kod,
            "razdjelNaziv": cur_razdjel_naziv,
            "programNaziv": cur_program_naziv,
            "programKodHint": cur_program_kod_hint,
            "aktivnostEntries": list(cur_akt_entries),
            "tekst": text,
            "pdfPage": page_no,
        })

    page_no = SEC_PROGRAMSKA[0]
    for idx in range(SEC_PROGRAMSKA[0] - 1, SEC_PROGRAMSKA[1]):
        page_no = idx + 1
        page_text = pages[idx] if idx < len(pages) else ""
        for line in page_text.split("\n"):
            line = line.strip()
            if not line:
                continue
            if NOISE_LINE.match(line):
                continue

            m = RAZDJEL_HEAD.match(line)
            if m:
                flush()
                cur_razdjel_kod = m.group(1).zfill(3)
                cur_razdjel_naziv = m.group(2).strip()
                cur_program_naziv = None
                cur_program_kod_hint = None
                cur_akt_entries = []
                continue

            m = PROGRAM_HEAD.match(line)
            if m:
                flush()
                kod, naziv = strip_leading_code(m.group(1))
                cur_program_kod_hint = kod if kod and kod.isdigit() else None
                cur_program_naziv = naziv
                cur_akt_entries = []
                continue

            m = AKT_HEAD_1.match(line)
            vrsta_raw, value = (m.group(1), m.group(2)) if m else (None, None)
            if not m:
                m = AKT_HEAD_2.match(line)
                if m:
                    vrsta_raw, value = m.group(1), m.group(2)
            if not m:
                m = AKT_HEAD_3.match(line)
                if m:
                    vrsta_raw, value = m.group(1), m.group(2)
            if m:
                flush()
                prefix = AKT_PREFIX_BY_VRSTA.get(vrsta_raw.lower().strip(), "A")
                cur_akt_entries = extract_akt_entries(value, prefix, cur_program_kod_hint)
                # ako kod aktivnosti otkriva program koji još nismo imenovali, koristi ga
                for e in cur_akt_entries:
                    if e["kod"] and not cur_program_kod_hint:
                        cur_program_kod_hint = e["kod"][1:5]
                continue

            buf.append(line)
            # sigurnosna kočnica: ako predugo ne naiđemo na novo prepoznato
            # zaglavlje (nekonzistentno formatiran dio izvještaja), prisilno
            # zatvori blok kako ne bi nastao jedan ogroman "odlomak"
            if sum(len(x) for x in buf) > 4000:
                flush()

    flush()
    return blocks


def index_programska_tree(razdjeli):
    """razdjelKod -> {programByKod, programByNazivNorm, aktByKod: {kod: (program_node, akt_node)},
    aktByNazivNorm: [(naziv_norm, program_node, akt_node)]}"""
    idx = {}
    for r in razdjeli:
        programs = []
        for g in r["glave"]:
            programs.extend(g["programi"])
            for k in g["korisnici"]:
                programs.extend(k["programi"])
        program_by_kod = {p["kod"]: p for p in programs}
        program_by_naziv = {normalize(p["naziv"]): p for p in programs}
        akt_by_kod = {}
        akt_by_naziv = []
        for p in programs:
            for a in p["aktivnosti"]:
                akt_by_kod[a["kod"]] = (p, a)
                akt_by_naziv.append((normalize(a["naziv"]), p, a))
        idx[r["kod"]] = {
            "programByKod": program_by_kod,
            "programByNaziv": program_by_naziv,
            "aktByKod": akt_by_kod,
            "aktByNaziv": akt_by_naziv,
        }
    return idx


def match_and_attach(blocks, razdjeli):
    tree_idx = index_programska_tree(razdjeli)
    matched_prog = matched_akt = unmatched = 0

    for b in blocks:
        ix = tree_idx.get(b["razdjelKod"])
        if ix is None:
            b["_programKod"], b["_aktivnostKodovi"] = None, []
            unmatched += 1
            continue

        akt_nodes = []
        program_node = None

        # 1) prednost: točni kodovi aktivnosti izvučeni iz zaglavlja
        for e in b["aktivnostEntries"]:
            if e["kod"] and e["kod"] in ix["aktByKod"]:
                p, a = ix["aktByKod"][e["kod"]]
                akt_nodes.append(a)
                program_node = program_node or p
            elif e["naziv"]:
                nn = normalize(e["naziv"])
                for anorm, p, a in ix["aktByNaziv"]:
                    if anorm == nn:
                        akt_nodes.append(a)
                        program_node = program_node or p
                        break

        # 2) program: eksplicitni kod, zatim naziv
        if program_node is None and b.get("programKodHint"):
            program_node = ix["programByKod"].get(b["programKodHint"])
        if program_node is None and b.get("programNaziv"):
            pn = normalize(b["programNaziv"])
            program_node = ix["programByNaziv"].get(pn)
            if program_node is None:
                for naziv_norm, node in ix["programByNaziv"].items():
                    if naziv_norm in pn or pn in naziv_norm:
                        program_node = node
                        break

        b["_programKod"] = program_node["kod"] if program_node else None
        b["_aktivnostKodovi"] = [a["kod"] for a in akt_nodes]
        if akt_nodes:
            matched_akt += 1
        elif program_node is not None:
            matched_prog += 1
        else:
            unmatched += 1

    print(f"Podudaranje 5.1 blokova: {matched_akt} na razini aktivnosti, "
          f"{matched_prog} na razini programa, {unmatched} bez podudaranja "
          f"(od ukupno {len(blocks)}).")
    return blocks


def build_narrative_index(blocks):
    """kljuc 'razdjel|program' i 'razdjel|program|aktivnost' -> [{tekst, pdfPage}]"""
    by_program = {}
    by_activity = {}
    for b in blocks:
        if not b["_programKod"]:
            continue
        pkey = f"{b['razdjelKod']}|{b['_programKod']}"
        by_program.setdefault(pkey, []).append({"tekst": b["tekst"], "pdfPage": b["pdfPage"]})
        for akod in b["_aktivnostKodovi"]:
            akey = f"{b['razdjelKod']}|{b['_programKod']}|{akod}"
            by_activity.setdefault(akey, []).append({"tekst": b["tekst"], "pdfPage": b["pdfPage"]})
    return {"poPrograma": by_program, "poAktivnosti": by_activity}


# ---------------------------------------------------------------------------
# 2) fiksne cjeline (obrazloženje prihoda/rashoda/investicija...)
# ---------------------------------------------------------------------------
NUMERIC_LINE = re.compile(r"^[\d.,\s%€]+$")


def extract_fixed_section(pages, start, end):
    paragraphs = []
    buf = []
    page_no = start

    def flush():
        text = clean_text(" ".join(buf).strip())
        text = re.sub(r"\s+", " ", text)
        buf.clear()
        if len(text) >= 40 and sum(c.isalpha() for c in text) > len(text) * 0.5:
            paragraphs.append({"tekst": text, "pdfPage": page_no})

    for idx in range(start - 1, end):
        page_no = idx + 1
        page_text = pages[idx] if idx < len(pages) else ""
        for line in page_text.split("\n"):
            line = line.strip()
            if not line:
                flush()
                continue
            if NUMERIC_LINE.match(line) or len(line) < 3 or not looks_like_prose(line):
                continue
            buf.append(line)
        flush()
    flush()
    return paragraphs


def main():
    pages = get_pdf_pages()
    print(f"PDF ima {len(pages)} stranica (pdftotext).")

    razdjeli = json.loads(PROGRAMSKA_JSON.read_text("utf-8"))

    print("Parsiram obrazloženje po programskoj klasifikaciji (5.1)...")
    blocks = parse_programska_narrative(pages)
    print(f"Pronađeno {len(blocks)} narativnih blokova u poglavlju 5.1.")
    blocks = match_and_attach(blocks, razdjeli)
    narrative_index = build_narrative_index(blocks)
    (OUT_DIR / "narrative-programska.json").write_text(
        json.dumps(narrative_index, ensure_ascii=False, indent=1), "utf-8")

    print("Parsiram fiksne narativne cjeline (prihodi/rashodi/investicije/...)...")
    sections = {}
    for key, title, start, end in FIXED_SECTIONS:
        paras = extract_fixed_section(pages, start, end)
        sections[key] = {"naslov": title, "pdfPageStart": start, "odlomci": paras}
        print(f"  {key}: {len(paras)} odlomaka (str. {start}-{end})")
    (OUT_DIR / "narrative-sections.json").write_text(
        json.dumps(sections, ensure_ascii=False, indent=1), "utf-8")

    print("Gradim popis dokumenata za pretragu...")
    docs = []
    for i, b in enumerate(blocks):
        title = " / ".join(filter(None, [
            f"Razdjel {b['razdjelKod']}", b["programNaziv"],
            ", ".join(e["naziv"] for e in b["aktivnostEntries"] if e["naziv"]) or None,
        ]))
        docs.append({
            "id": f"prog-{i}", "naslov": title, "tekst": b["tekst"],
            "pdfPage": b["pdfPage"], "tip": "programska",
            "programKod": b["_programKod"], "aktivnostKodovi": b["_aktivnostKodovi"],
            "razdjelKod": b["razdjelKod"],
        })
    for key, sec in sections.items():
        for i, p in enumerate(sec["odlomci"]):
            docs.append({
                "id": f"{key}-{i}", "naslov": sec["naslov"], "tekst": p["tekst"],
                "pdfPage": p["pdfPage"], "tip": "sekcija", "sekcija": key,
            })
    (OUT_DIR / "search-documents.json").write_text(
        json.dumps(docs, ensure_ascii=False, indent=1), "utf-8")
    print(f"Ukupno {len(docs)} dokumenata za pretragu.")


if __name__ == "__main__":
    main()

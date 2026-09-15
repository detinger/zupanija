#!/usr/bin/env python3
"""
Parsira '1.OPĆI I POSEBNI.xlsx' (Godišnji izvještaj o izvršenju Proračuna
Istarske županije za 2025.) u statičke JSON fileove koje frontend čita.

Pokretanje:  python3 scripts/extract_xlsx.py
Izlaz:       public/data/*.json
"""
import json
import re
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
SRC_XLSX = ROOT / "public" / "izvornici" / "OPCI-I-POSEBNI-DIO.xlsx"
OUT_DIR = ROOT / "public" / "data"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def num(v):
    if v is None or v == "":
        return None
    if isinstance(v, (int, float)):
        return round(float(v), 2)
    return v


def load():
    print(f"Učitavam {SRC_XLSX} ...")
    return openpyxl.load_workbook(SRC_XLSX, data_only=True)


# ---------------------------------------------------------------------------
# 1. sažetak
# ---------------------------------------------------------------------------
def parse_sazetak(ws):
    rows = list(ws.iter_rows(min_row=1, max_row=ws.max_row, values_only=True))
    out = []
    for row in rows:
        a, b = row[0], row[1]
        vals = row[2:8]
        if a is None and all(v is None for v in vals):
            continue
        label = str(a).strip() if a is not None else ""
        if label in ("", ) and vals == (None,) * 6:
            continue
        # section headers e.g. "A. RAČUN PRIHODA I RASHODA", "REKAPITULACIJA"
        if label and all(v is None for v in vals) and b is None:
            out.append({"kind": "section", "label": label})
            continue
        # legend row ('0','4','2','3',4,5,6...) - skip
        if label in ("0",) or label == "":
            if label == "":
                # could be legend row where col0 is None but b='0'
                pass
        konto = label if label and not label[0].isalpha() and label not in (
            "Razlika", "Neto financiranje", "UKUPAN VIŠAK/MANJAK",
            "Višak/manjak iz predhodnih godina", "Višak/manjak iz prethodnih godina",
        ) else None
        desc = str(b).strip() if b is not None else (label if konto is None else None)
        if desc is None and konto is None:
            desc = label
        entry = {
            "konto": konto,
            "opis": desc,
            "izvrsenje2024": num(vals[0]),
            "izvorniPlan2025": num(vals[1]),
            "tekuciPlan2025": num(vals[2]),
            "izvrsenje2025": num(vals[3]),
            "indeks41": num(vals[4]),
            "indeks42": num(vals[5]),
        }
        if entry["opis"] is None and entry["konto"] is None:
            continue
        out.append({"kind": "row", **entry})
    return out


# ---------------------------------------------------------------------------
# generički flat-table parser (ekonomska, izvori, funkcijska, financiranje)
# ---------------------------------------------------------------------------
LEGEND = {"1", "2", "3", "4", "5", "6"}


def find_data_start(rows):
    for i, row in enumerate(rows):
        vals = [str(v).strip() if v is not None else "" for v in row[1:7]]
        if vals[:6] == ["1", "2", "3", "4", "5", "6"]:
            return i + 1
    return 5


def parse_flat(ws, code_re, strip_prefix=None, level_fn=None):
    rows = list(ws.iter_rows(min_row=1, max_row=ws.max_row, values_only=True))
    start = find_data_start(rows)
    out = []
    for row in rows[start:]:
        a = row[0]
        if a is None:
            continue
        label_raw = str(a).strip()
        if not label_raw:
            continue
        vals = row[1:7]
        if all(v is None for v in vals):
            continue
        text = label_raw
        if strip_prefix and text.startswith(strip_prefix):
            text = text[len(strip_prefix):].strip()
        m = code_re.match(text)
        if m:
            code = m.group(1)
            desc = m.group(2).strip()
        else:
            code = None
            desc = text.strip()
        level = level_fn(code) if (level_fn and code) else 0
        out.append({
            "kod": code,
            "opis": desc,
            "izvrsenje2024": num(vals[0]),
            "izvorniPlan2025": num(vals[1]),
            "tekuciPlan2025": num(vals[2]),
            "izvrsenje2025": num(vals[3]),
            "indeks41": num(vals[4]),
            "indeks43": num(vals[5]),
            "razina": level,
        })
    return out


def parse_financiranje_izvori(ws):
    """Poseban slučaj: dvije sekcije (primici/izdaci) bez 'Izvor' prefiksa."""
    rows = list(ws.iter_rows(min_row=1, max_row=ws.max_row, values_only=True))
    start = find_data_start(rows)
    out = []
    section = None
    code_re = re.compile(r"^([\d.]+)\s+(.*)$")
    for row in rows[start:]:
        a = row[0]
        if a is None:
            continue
        label_raw = str(a).strip()
        if not label_raw:
            continue
        vals = row[1:7]
        upper = label_raw.upper()
        if upper == "UKUPNI PRIMICI":
            section = "primici"
        elif upper == "UKUPNI IZDACI":
            section = "izdaci"
        m = code_re.match(label_raw)
        code = m.group(1) if m else None
        desc = m.group(2).strip() if m else label_raw
        level = code.count(".") if code else 0
        out.append({
            "sekcija": section,
            "kod": code,
            "opis": desc,
            "izvrsenje2024": num(vals[0]),
            "izvorniPlan2025": num(vals[1]),
            "tekuciPlan2025": num(vals[2]),
            "izvrsenje2025": num(vals[3]),
            "indeks41": num(vals[4]),
            "indeks43": num(vals[5]),
            "razina": level,
        })
    return out


# ---------------------------------------------------------------------------
# Izvršenje po organizacijskoj klasifikaciji
# ---------------------------------------------------------------------------
def parse_organizational(ws):
    rows = list(ws.iter_rows(min_row=1, max_row=ws.max_row, values_only=True))
    out = []
    for row in rows:
        tip, kod, opis = row[0], row[1], row[2]
        vals = row[3:7]
        if tip not in ("Razdjel", "Glava"):
            continue
        out.append({
            "tip": tip,
            "kod": str(kod).strip() if kod is not None else None,
            "opis": str(opis).strip() if opis is not None else None,
            "izvorniPlan2025": num(vals[0]),
            "tekuciPlan2025": num(vals[1]),
            "izvrsenje2025": num(vals[2]),
            "indeks": num(vals[3]),
        })
    return out


# ---------------------------------------------------------------------------
# Izvršenje po programskoj klasifikaciji (17.5k redaka, glavni stablo-prikaz)
# ---------------------------------------------------------------------------
RAZDJEL_RE = re.compile(r"^RAZDJEL\s+(\S+)\s+(.*)$")
GLAVA_RE = re.compile(r"^GLAVA\s+(\S+)\s+(.*)$")
PROR_RE = re.compile(r"^PROR\.\s*KORISNIK\s+(\S+)\s+(.*)$")
IZVOR_RE = re.compile(r"^Izvor\s+([\d.]+)\s*(.*)$")
EKON2_RE = re.compile(r"^(\d{2})$")
EKON4_RE = re.compile(r"^(\d{3,4})$")

AKT_TYPE_BY_PREFIX = {"A": "Aktivnost", "K": "Kapitalni projekt", "T": "Tekući projekt"}


def make_totals(row):
    # stupci: [Projekt/Aktivnost, None, VRSTA, None,None,None,None,None, IzvorniPlan, None, TekuciPlan, None, Izvrsenje, None, Indeks, None]
    return {
        "izvorniPlan2025": num(row[8]),
        "tekuciPlan2025": num(row[10]),
        "izvrsenje2025": num(row[12]),
        "indeks": num(row[14]),
    }


def parse_programska(ws):
    rows = list(ws.iter_rows(min_row=5, max_row=ws.max_row, values_only=True))

    razdjeli = []
    cur_razdjel = None
    cur_glava = None
    cur_prorkor = None  # proračunski korisnik, ako postoji
    cur_program = None
    cur_aktivnost = None
    # "spremnik" u koji trenutno upisujemo Program-e (glava ili prorkorisnik)
    cur_container = None

    def new_program_holder(node):
        node.setdefault("programi", [])
        return node

    for row in rows:
        a = row[0]
        c = row[2]
        if a is None:
            continue
        a_s = str(a).strip()
        if not a_s:
            continue
        c_s = str(c).strip() if c is not None else ""

        if a_s == "UKUPNO RASHODI I IZDATCI":
            continue

        m = RAZDJEL_RE.match(a_s)
        if m:
            cur_razdjel = {
                "kod": m.group(1), "naziv": m.group(2).strip(), "glave": [],
                **make_totals(row),
            }
            razdjeli.append(cur_razdjel)
            cur_glava = cur_prorkor = cur_program = cur_aktivnost = None
            cur_container = None
            continue

        m = GLAVA_RE.match(a_s)
        if m:
            cur_glava = {
                "kod": m.group(1), "naziv": m.group(2).strip(),
                "korisnici": [], **new_program_holder({}), **make_totals(row),
            }
            if cur_razdjel is not None:
                cur_razdjel["glave"].append(cur_glava)
            cur_prorkor = cur_program = cur_aktivnost = None
            cur_container = cur_glava
            continue

        m = PROR_RE.match(a_s)
        if m:
            cur_prorkor = {
                "id": m.group(1), "naziv": m.group(2).strip(),
                **new_program_holder({}), **make_totals(row),
            }
            if cur_glava is not None:
                cur_glava["korisnici"].append(cur_prorkor)
            cur_program = cur_aktivnost = None
            cur_container = cur_prorkor
            continue

        if c_s.startswith("Program:") or c_s.startswith("Program :"):
            naziv = c_s.split(":", 1)[1].strip()
            cur_program = {"kod": a_s, "naziv": naziv, "aktivnosti": [], **make_totals(row)}
            if cur_container is not None:
                cur_container["programi"].append(cur_program)
            cur_aktivnost = None
            continue

        akt_prefix = a_s[0] if a_s and a_s[0] in AKT_TYPE_BY_PREFIX else None
        if akt_prefix and re.match(r"^[AKT]\d{6}$", a_s) and (
            c_s.startswith("Aktivnost:") or c_s.startswith("Kapitalni projekt:") or
            c_s.startswith("Tekući projekt:") or c_s.startswith("Kapitalni  projekt:")
        ):
            naziv = c_s.split(":", 1)[1].strip()
            cur_aktivnost = {
                "kod": a_s, "tip": AKT_TYPE_BY_PREFIX[akt_prefix], "naziv": naziv,
                "stavke": [], **make_totals(row),
            }
            if cur_program is not None:
                cur_program["aktivnosti"].append(cur_aktivnost)
            continue

        # detalj-redak (Izvor / ekonomski konto) - dodaj kao stavku pod trenutnu aktivnost
        if cur_aktivnost is not None:
            if IZVOR_RE.match(a_s):
                continue  # preskačemo izvor-grupiranje, ostajemo na razini konta
            if EKON4_RE.match(a_s) or EKON2_RE.match(a_s):
                izvrsenje = num(row[12])
                if izvrsenje is None:
                    continue
                cur_aktivnost["stavke"].append({
                    "konto": a_s, "opis": c_s, "izvrsenje2025": izvrsenje,
                })
    return razdjeli


# ---------------------------------------------------------------------------
def main():
    wb = load()

    print("Parsiram sažetak...")
    (OUT_DIR / "sazetak.json").write_text(
        json.dumps(parse_sazetak(wb["sažetak"]), ensure_ascii=False, indent=1), "utf-8")

    print("Parsiram ekonomsku klasifikaciju...")
    ekonomska = parse_flat(
        wb["Prihodi i rashodi prema ekonoms"],
        code_re=re.compile(r"^(\d{1,6})\s+(.*)$"),
        level_fn=lambda code: len(code),
    )
    (OUT_DIR / "ekonomska.json").write_text(
        json.dumps(ekonomska, ensure_ascii=False, indent=1), "utf-8")

    print("Parsiram prihode/rashode prema izvorima...")
    izvori = parse_flat(
        wb["Prihodi i rashodi prema izvorim"],
        code_re=re.compile(r"^Izvor\s+([\d.]+)\s+(.*)$"),
        level_fn=lambda code: code.count("."),
    )
    (OUT_DIR / "izvori-financiranja.json").write_text(
        json.dumps(izvori, ensure_ascii=False, indent=1), "utf-8")

    print("Parsiram funkcijsku klasifikaciju...")
    funkcijska = parse_flat(
        wb["Rashodi prema funkcijskoj klasi"],
        code_re=re.compile(r"^(\d{2,4})\s+(.*)$"),
        strip_prefix="Funkcijska klasifikacija",
        level_fn=lambda code: len(code),
    )
    (OUT_DIR / "funkcijska.json").write_text(
        json.dumps(funkcijska, ensure_ascii=False, indent=1), "utf-8")

    print("Parsiram račun financiranja (ekonomska)...")
    fin_ekon = parse_flat(
        wb["Račun financiranja prema ekonom"],
        code_re=re.compile(r"^(\d{1,6})\s+(.*)$"),
        level_fn=lambda code: len(code),
    )
    (OUT_DIR / "financiranje-ekonomska.json").write_text(
        json.dumps(fin_ekon, ensure_ascii=False, indent=1), "utf-8")

    print("Parsiram račun financiranja (izvori)...")
    fin_izvori = parse_financiranje_izvori(wb["Račun financiranja prema izvori"])
    (OUT_DIR / "financiranje-izvori.json").write_text(
        json.dumps(fin_izvori, ensure_ascii=False, indent=1), "utf-8")

    print("Parsiram organizacijsku klasifikaciju...")
    org = parse_organizational(wb["Izvršenje po organizacijskoj kl"])
    (OUT_DIR / "organizacijska.json").write_text(
        json.dumps(org, ensure_ascii=False, indent=1), "utf-8")

    print("Parsiram programsku klasifikaciju (ovo može potrajati)...")
    programska = parse_programska(wb["Izvršenje po programskoj kl"])
    (OUT_DIR / "programska.json").write_text(
        json.dumps(programska, ensure_ascii=False, indent=1), "utf-8")

    # brza statistika za sanity-check
    n_razdjel = len(programska)
    n_glava = sum(len(r["glave"]) for r in programska)
    n_prog = sum(
        len(g["programi"]) + sum(len(k["programi"]) for k in g["korisnici"])
        for r in programska for g in r["glave"]
    )
    n_akt = 0
    for r in programska:
        for g in r["glave"]:
            for p in g["programi"]:
                n_akt += len(p["aktivnosti"])
            for k in g["korisnici"]:
                for p in k["programi"]:
                    n_akt += len(p["aktivnosti"])
    print(f"Programska klasifikacija: {n_razdjel} razdjela, {n_glava} glava, "
          f"{n_prog} programa, {n_akt} aktivnosti/projekata.")

    print("Gotovo. JSON fileovi u", OUT_DIR)


if __name__ == "__main__":
    main()

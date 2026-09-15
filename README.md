# Proračun Istarske županije 2025 — interaktivni izvještaj

Statična web aplikacija (bez baze podataka) koja vizualizira Godišnji izvještaj o
izvršenju Proračuna Istarske županije za 2025. godinu i povezuje podatke s
odgovarajućim tekstom obrazloženja iz izvornog PDF-a.

## Pokretanje

```bash
npm install
npm run dev       # razvojni server, http://localhost:5173
npm run build     # produkcijski build u dist/ (statični fileovi, deploy bilo gdje)
```

## Podatkovni pipeline

Svi prikazani podaci generirani su iz tri izvorna dokumenta u `public/izvornici/`
(preuzeti iz `1.OPĆI I POSEBNI.xlsx`, službenog PDF-a i pratećeg `.doc` obrazloženja).
Generiranje se pokreće ručno, samo kad se izvorni dokumenti promijene:

```bash
python3 -m pip install --break-system-packages openpyxl   # jednom
python3 scripts/extract_xlsx.py       # -> public/data/{sazetak,ekonomska,...,programska}.json
python3 scripts/extract_pdf_text.py   # -> public/data/{narrative-*,search-documents}.json
```

`extract_xlsx.py` parsira svih 8 listova radne tablice, uključujući punu
hijerarhiju programske klasifikacije (Razdjel → Glava → Proračunski korisnik →
Program → Aktivnost/Projekt), ~17.500 redaka.

`extract_pdf_text.py` pokreće `pdftotext -layout`/`pdftotext` nad 1.048-stranačnim
PDF-om, prepoznaje zaglavlja poglavlja te tekst obrazloženja povezuje s odgovarajućim
programima/aktivnostima po točnim šiframa gdje je moguće (fallback na usporedbu
naziva). Podudaranje je **best-effort** — dio programa/aktivnosti u izvorniku nema
zasebno razrađeno obrazloženje pa za njih nema uparenog teksta.

## Stack

Vite + React + TypeScript, Tailwind CSS v4, D3.js (karta udjela rashoda), responzivni grafovi plan/izvršenje i preglednik
programske hijerarhije, MiniSearch
(client-side full-text pretraga), react-router (stanje odabira/drill-downa je u
URL-u pa je svaki prikaz shareable linkom).

## Vizualni identitet

Boje i logotip preuzeti sa službene stranice `istra-istria.hr` i iz grba Istarske
županije (`public/brand/`) — vidi `src/index.css` (`--color-iz-*` tokeni).

## Napomena

Ovo nije službena stranica Istarske županije. Za sve pravno mjerodavne podatke
vrijedi isključivo izvorni PDF dostupan na stranici „Preuzimanja”.

## Interaktivni prikazi

- Naslovnica: ključni pokazatelji, raspodjela funkcija, plan i izvršenje.
- Rashodi: karta udjela, 3 mjere, detalji potkategorija, CSV i dijeljenje pogleda.
- Programi: razdjeli → glave → programi → aktivnosti, filtri, izvoz i obrazloženja.
- Investicije: 189 kapitalnih projekata, filtri po nazivu i razdjelu te izravne poveznice.
- Pretraga: tekst izvještaja, sačuvan upit u URL-u i poveznice na PDF.

Detalji provjera: `VALIDATION.md`. Site konfiguracija nalazi se u `.openai/hosting.json`.

# Provjera aplikacije

## Podaci

- Funkcijska klasifikacija: svih 10 funkcija usklađeno s ukupnim rashodima
  iz sažetka za izvršenje 2024., tekući plan 2025. i izvršenje 2025.
- Svaka skupina potkategorija usklađena s roditeljskom funkcijom; zbroj udjela 100 %.
- Provjereno svih 1.601 jedinstvenih poveznica na aktivnosti/projekte u programskoj hijerarhiji.
- Rashodi i izdaci programske klasifikacije prikazani odvojeno od obuhvata funkcijske klasifikacije.
- Kapitalni projekti odabrani prema oznaci u izvorniku. Zbroj kapitalnih projekata
  nije poistovjećen s ekonomskom kategorijom nabave nefinancijske imovine.

## Ponovljive provjere

```sh
npm run build
npm run lint
node scripts/check-budget-explorer.ts
node scripts/check-program-tree.ts
```

## Preglednik

Chromium: svih 9 ruta provjereno na širinama 1440 i 390 px. Nema vodoravnog
prelijevanja cijele stranice. Šire tablice imaju vlastito pomicanje.

Provjereni mobilni izbornik, prebacivanje mjere rashoda, odabir obrazovanja i
njegovih 7 potkategorija, obnova odabira nakon osvježavanja, prolazak svih
4 razina programske hijerarhije, povratak na korijen, filtriranje glavnih stavki
u tablici i stvarno preuzimanje PNG grafa.

Provjereni su filtar kapitalnih projekata i izravno otvaranje odabranog projekta,
pretraga i stanje bez rezultata, nepostojeća ruta te oporavak nakon namjerno
prekinutog učitavanja podataka. Sadržaj sva tri preuzeta izvornika identičan je
lokalnim dokumentima (provjeren SHA-256). Završni build i lint prolaze bez upozorenja.

Tekst obrazloženja ostaje povezan prema postojećim pravilima iz izvornog
pipelinea. Uparivanje je best-effort i dio stavki nema izravno upareno obrazloženje.

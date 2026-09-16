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

Pokrenuti iz `app/`, nakon `npm ci`. Za izravno pokretanje `.ts` skripti
koristiti aktualni Node.js 22 LTS, najmanje 22.18.

```sh
npm run build
npm run lint
node scripts/check-budget-explorer.ts
node scripts/check-program-tree.ts
```

## Preglednik — prethodna verzija (prije prezentacijskog redizajna)

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

## Prezentacijski redizajn — 15. rujna 2026.

- TypeScript i produkcijska izgradnja prolaze; lint prolazi bez upozorenja.
- Ponovljene provjere svih 10 funkcija, tri mjere, zbrojeva potkategorija i 1.601 poveznice prolaze.
- Novi prikazi koriste iste podatke i razinu agregiranja. Mreža 100 polja koristi metodu najvećih ostataka; graf je označen kao zaokružena ilustracija.
- Pet poglavlja, odabir funkcije i prezentacijski način čuvaju se u URL-u. Vrsta detaljnog prikaza rashoda čuva se u parametru `prikaz`.
- Lokalni poslužitelj vraća HTTP 200. Automatsko otvaranje pregleda nije bilo dostupno u ovom okruženju.
- Pregledničke i vizualne provjere nisu ponavljane za ovaj redizajn; prethodni rezultati iznad odnose se na prethodnu verziju.

## Repozitorij i Netlify — 16. rujna 2026.

- Git korijen je `zupanija/`; aplikacija i dalje ostaje u `app/`.
- Ponovljeni `npm run build`, `npm run lint` i obje podatkovne provjere prolaze (lokalni Node.js 26.8.2).
- Provjereno 10 funkcija, tri mjere, zbrojevi potkategorija i 1.601 jedinstvena programska poveznica.
- SHA-256 potvrđuje da tri dokumenta za preuzimanje odgovaraju izvornicima u korijenu. Sve javne datoteke odgovaraju kopijama u produkcijskom izlazu; relativne poveznice u Markdown dokumentima postoje, a ovisnosti u `package.json` i `package-lock.json` su usklađene.
- Netlify konfiguracija u korijenu: `base = "app"`, `command = "npm run build"`, `publish = "dist"`, Node.js 22 i SPA preusmjeravanje na `/index.html` sa statusom 200.
- Lokalna izgradnja ne potvrđuje uspjeh Netlify objave. Live URL i zapisnik ponovne objave nisu dostavljeni; otvaranje stranice i izravnih ruta na Netlifyju ostaju neprovjereni.
- Pregledničke i vizualne provjere nisu ponavljane u ovom pregledu.

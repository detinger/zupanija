# Proračun Istarske županije 2025.

Interaktivni prikaz godišnjeg izvještaja o izvršenju proračuna.
Git repozitorij nalazi se u korijenu `zupanija`; aplikacija je u `app/`.

## Lokalno pokretanje

Koristite aktualni Node.js 22 LTS (najmanje 22.18 za izravno pokretanje TypeScript provjera).
Iz korijena repozitorija:

```sh
cd app
npm ci
npm run dev
```

Produkcijska izgradnja: `npm run build` iz `app/`; rezultat je `app/dist/`.

## Dokumentacija i datoteke

- [Dokumentacija aplikacije](app/README.md): prikazi, podaci i razvoj.
- [Provjere](app/VALIDATION.md): rezultati i ograničenja provjere.
- [Povijest izmjena](change.md): razvoj, premještanje repozitorija i hosting.
- Izvorni XLSX, DOC i PDF dokumenti nalaze se u korijenu; kopije za preuzimanje u `app/public/izvornici/`.
- `app/public/data/` sadrži unaprijed generirane JSON podatke.

## Netlify

[netlify.toml](netlify.toml) postavlja osnovni direktorij `app`, naredbu
`npm run build`, izlazni direktorij `dist` (u odnosu na `app`) i Node.js 22.
Pravilo `/* → /index.html` sa statusom 200 omogućuje izravne poveznice i
osvježavanje React ruta; postojeće statičke datoteke poslužuju se normalno.

Povežite Netlify s repozitorijem [detinger/zupanija](https://github.com/detinger/zupanija)
i granom `main`. Za ručnu objavu prenosi se sadržaj izgrađenog `app/dist/`,
uz zasebno postavljanje istog pravila za rute na hostingu.

Konfiguracija za prethodni Sites hosting ostaje u `app/.openai/hosting.json`.
Netlify je ne koristi. Live Netlify URL i rezultat ponovne objave još nisu potvrđeni.

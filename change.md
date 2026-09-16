# Pregled napravljenih izmjena

**Projekt:** Interaktivni proračun Istarske županije za 2025. godinu  
**Datum:** 15. rujna 2026.  
**Aplikacija:** [Proračun Istarske županije 2025.](https://istra-proracun-2025.darko-etinger.chatgpt.site)  
**Objava:** privatna demonstracijska verzija, verzija 2 (prezentacijski redizajn)

## 1. Sažetak

Modernizirana je postojeća aplikacija kako bi se velika količina proračunskih
podataka mogla pregledavati kroz razumljive vizualizacije, filtre i povezane
detalje. Ujednačen je izgled stranica, obnovljena naslovnica, izrađen interaktivni
pregled rashoda te prerađen prolazak kroz programe i aktivnosti. Dodan je pregled
kapitalnih projekata sa stvarnim iznosima.

Rad je nadogradio postojeću React/TypeScript aplikaciju, već izdvojene JSON podatke,
izvorne dokumente i postojeći mehanizam povezivanja obrazloženja. Izvorna obrada
Excel/PDF dokumenata nije ponovno izrađivana. Aplikacija i dalje koristi statičke
podatke izdvojene iz izvještaja; nije uvedena baza podataka niti sinkronizacija uživo.

## 2. Zajednički dizajn i navigacija

- Izrađen je zajednički vizualni sustav: tamnoplava bočna navigacija, svijetla
  radna površina, zelene i plave naglasne boje, ujednačene kartice i razmaci.
- Zadržani su postojeći grb i identitet Istarske županije.
- Na računalu je uvedena stalna bočna navigacija i gornja traka s nazivom prikaza,
  pretragom izvještaja i oznakom godine.
- Mobilni izbornik otvara se preko sadržaja, uz zatamnjenje pozadine. Zatvara se
  odabirom stranice, klikom na pozadinu ili tipkom Escape.
- Dodana je poveznica za preskakanje navigacije i odlazak izravno na sadržaj.
- Ujednačeni su vidljivi pokazatelji fokusa za upravljanje tipkovnicom.
- Naslov kartice preglednika mijenja se prema otvorenoj stranici.
- Uređeni su prikaz na malim zaslonima, stilovi za ispis i ponašanje uz korisničku
  postavku smanjenog kretanja.
- Postavljena je svijetla shema boja kako sistemski tamni način ne bi stvarao
  nesklad s izgledom aplikacije.

**Glavne datoteke:** [Layout.tsx](app/src/components/Layout.tsx),
[presentation.css](app/src/presentation.css), [index.css](app/src/index.css),
[KpiCard.tsx](app/src/components/KpiCard.tsx), [main.tsx](app/src/main.tsx).

## 3. Nova naslovnica

- Duga uvodna sekcija zamijenjena je pregledom koji odmah prikazuje važne brojke.
- Izdvojeni su ukupni prihodi, ukupni rashodi, nabava nefinancijske imovine i
  ukupan višak na kraju godine.
- Veliki iznosi prikazuju se u čitljivom obliku, primjerice `229,6 mil. €`.
- Dodana je raspodjela rashoda po funkcijama kroz proporcionalnu obojenu traku
  i popis najvećih kategorija.
- Klik na funkciju otvara njezin odabrani prikaz na stranici rashoda.
- Dodana je usporedba tekućeg plana i izvršenja prihoda, rashoda i nabave imovine.
- Objašnjena je razlika između ukupnog viška na kraju godine i razlike prihoda
  i rashoda ostvarene tijekom same 2025. godine.
- Broj programa i aktivnosti računa se iz podataka: 517 programa i 1.601
  aktivnost/projekt.
- Dodane su jasne poveznice prema programima, upravnim tijelima i investicijama.

**Datoteka:** [Naslovnica.tsx](app/src/pages/Naslovnica.tsx).

## 4. Interaktivni pregled „Kamo odlazi proračun?”

Na postojećoj ruti `/rashodi` ugrađen je novi pregled funkcijske klasifikacije.

- Karta prikazuje polja čije površine odgovaraju iznosima rashoda.
- Svih 10 funkcija može se odabrati i kroz čitljiv popis, uključujući kategorije
  premale za naziv unutar same karte.
- Dostupne su tri mjere: izvršenje 2025., tekući plan 2025. i izvršenje 2024.
- Boje funkcija ostaju iste pri promjeni mjere i redoslijeda.
- Odabir funkcije prikazuje iznos, udio, izvršenje plana i usporedbu s 2024.
- Dodan je prikaz „Od svakih 100 € rashoda” radi lakšeg razumijevanja udjela.
- Prikazuju se pripadajuće potkategorije s iznosima i relativnim udjelima.
- Odabir se čuva u URL-u kroz parametre `funkcija` i `mjera`, pa se može podijeliti
  ili obnoviti osvježavanjem stranice.
- Dodani su kopiranje poveznice, CSV izvoz i poveznica na izvorni Excel.
- Postojeća tablica i usporedni graf ostali su dostupni u sklopivom odjeljku.
- Vrlo mali pozitivni udjeli prikazuju se kao `< 0,1 %`, umjesto prividne nule.
- Izračuni koriste jednu razinu hijerarhije kako se roditeljske stavke i njihove
  potkategorije ne bi dvostruko brojale.

**Datoteke:** [BudgetExplorer.tsx](app/src/components/BudgetExplorer.tsx),
[BudgetExplorer.css](app/src/components/BudgetExplorer.css),
[budgetExplorer.ts](app/src/lib/budgetExplorer.ts), [Rashodi.tsx](app/src/pages/Rashodi.tsx).

## 5. Programi i projekti

Pregled programa prerađen je u postupno otvaranje hijerarhije:

**Svi razdjeli → glave i ustanove → programi → aktivnosti i projekti → ekonomska konta.**

- Početni prikaz pokazuje sve razdjele, bez automatskog otvaranja prvog programa.
- Svaki odabrani korak prikazuje pripadajući plan, izvršenje i postotak realizacije.
- Dodane su putanja odabira i mogućnost povratka na pojedinu razinu ili korijen.
- Stavke imaju čitljive nazive, iznose i trake za usporedbu veličine rashoda.
- Dodani su filtriranje po nazivu ili šifri i sortiranje po iznosu ili nazivu.
- Programi proračunskih korisnika prikazuju i naziv pripadajuće ustanove.
- Ispravljeno je čuvanje konteksta pri odabiru aktivnosti i prelasku između razina.
- Zadržana je podrška za poveznice s parametrima `r`, `g`, `p`, `a` i `razdjel`.
- CSV izvoz prati trenutačno prikazane stavke; obrazloženje se može zasebno
  preuzeti kao JSON.
- Na razini aktivnosti prikazuju se ekonomska konta i povezano obrazloženje.
- Jasno je naznačeno da programska klasifikacija uključuje rashode i izdatke.

**Datoteke:** [Programska.tsx](app/src/pages/Programska.tsx),
[programTree.ts](app/src/lib/programTree.ts).

## 6. Kapitalni projekti i investicije

- Na stranicu investicija dodan je pregled 189 kapitalnih projekata iz programske
  klasifikacije.
- Dodani su pretraga po nazivu, ustanovi ili šifri te filtar po razdjelu.
- Broj projekata, ukupno izvršenje i izvršenje plana ažuriraju se prema filtrima.
- Projekti su poredani prema izvršenom iznosu, uz postupno prikazivanje dodatnih stavki.
- Klik na projekt otvara njegovu točnu aktivnost u programskom pregledniku.
- CSV izvoz obuhvaća sve projekte koji odgovaraju odabranim filtrima.
- Postojeće tekstualno obrazloženje investicija i namjenska sredstva smješteni su
  u zaseban sklopivi odjeljak.
- Objašnjeno je da zbroj kapitalnih projekata nije isto što i ekonomska kategorija
  nabave nefinancijske imovine.

**Datoteke:** [CapitalProjects.tsx](app/src/components/CapitalProjects.tsx),
[Investicije.tsx](app/src/pages/Investicije.tsx).

## 7. Grafovi, tablice i pretraga

### Grafovi

- Zajednički graf plana i izvršenja prerađen je u responzivne vodoravne trake
  s čitljivim nazivima, iznosima i postocima.
- Zadržan je PNG izvoz kroz zaseban SVG prikaz za preuzimanje.
- Dodana je poruka ako preuzimanje grafa ne uspije.

### Tablice

- Ispravljen je filtar „Prikaži samo glavne stavke” tako da koristi stvarnu
  glavnu razinu klasifikacije.
- Ispravljeno je označavanje odabranih redaka s praznom šifrom.
- Dodano je aktiviranje redaka tipkama Enter i razmaknicom.
- Sortiranje zaglavlja dostupno je preko gumba kojima se može upravljati tipkovnicom.
- Uklonjen je obrazac stvaranja komponente ikone sortiranja unutar svakog renderiranja.

### Pretraga

- Upit u URL-u postao je jedinstveni izvor stanja pretrage.
- Odgođeno je računanje rezultata tijekom unosa radi mirnijeg rada sučelja.
- Prikazuje se stvaran ukupan broj rezultata, uz oznaku kada je prikazano prvih 40.
- Dodani su jasna poruka bez rezultata i pristupačni nazivi kontrola.
- Poveznica iz rezultata nazvana je „Programi razdjela” kako bi odgovarala svom odredištu.

**Datoteke:** [BarChart.tsx](app/src/components/BarChart.tsx),
[DataTable.tsx](app/src/components/DataTable.tsx), [Pretraga.tsx](app/src/pages/Pretraga.tsx).

## 8. Pouzdanost i učitavanje

- Prerađen je `useData`: zahtjevi u tijeku čiste se i nakon pogreške, a pri promjeni
  izvora ne vraćaju se podaci prethodnog izvora.
- Dodan je zajednički prikaz pogreške s mogućnošću ponovnog pokušaja.
- Dodana je stranica za nepostojeće rute s povratkom na pregled proračuna.
- Uvedeno je odgođeno učitavanje pojedinih stranica radi manjeg početnog paketa.
- U karticama pokazatelja uklonjena je animacija koja je parsirala već formatirane
  iznose; brojke se sada prikazuju izravno.
- Ograničeno je kašnjenje animacije dugih popisa odlomaka obrazloženja.
- Uklonjeno je preostalo upozorenje o izmjeni akumulatora u komponenti `IcicleRow`.
- Dopunjena je dokumentacija i ignoriranje generiranih Python datoteka u Gitu.

**Datoteke:** [useData.ts](app/src/lib/useData.ts),
[ErrorBoundary.tsx](app/src/components/ErrorBoundary.tsx), [App.tsx](app/src/App.tsx),
[NarrativePanel.tsx](app/src/components/NarrativePanel.tsx),
[IcicleRow.tsx](app/src/components/IcicleRow.tsx), [README.md](app/README.md).

## 9. Provedene provjere

### Točnost podataka

- Za svih 10 funkcija provjereno je slaganje s ukupnim rashodima iz sažetka za
  sve tri mjere.
- Provjereno je slaganje svake skupine potkategorija s roditeljskom funkcijom.
- Provjeren je zbroj udjela od 100 % i ponašanje pri nultoj osnovici.
- Potvrđen je ukupan iznos izvršenih rashoda: **229.579.222,36 €**.
- Provjereno je svih **1.601 jedinstvenih poveznica** na aktivnosti i projekte.

### Preglednik

Lokalna aplikacija provjerena je u Chromiumu na širinama **1440 px i 390 px**.

- Otvoreno je svih devet glavnih ruta; nije utvrđeno vodoravno prelijevanje cijele stranice.
- Provjereni su mobilni izbornik, odabir funkcije, promjena mjere i obnova odabira
  nakon osvježavanja.
- Provjereni su prolazak kroz četiri razine programa i povratak na korijen.
- Provjereni su filtriranje glavnih stavki, filtar kapitalnih projekata i otvaranje
  konkretnog projekta.
- Provjereni su pretraga, stanje bez rezultata i nepostojeća ruta.
- Namjerno je prekinuto učitavanje podataka te potvrđen uspješan oporavak nakon
  ponovnog pokušaja.
- Stvarno je preuzet PNG grafa.
- Preuzeta su sva tri izvornika; SHA-256 provjerom potvrđeno je da njihov sadržaj
  odgovara lokalnim PDF, XLSX i DOC dokumentima.
- Završni build i lint prošli su bez upozorenja.

Ponovljive provjere, iz direktorija `app`:

```sh
npm run build
npm run lint
node scripts/check-budget-explorer.ts
node scripts/check-program-tree.ts
```

**Datoteke provjera:** [check-budget-explorer.ts](app/scripts/check-budget-explorer.ts),
[check-program-tree.ts](app/scripts/check-program-tree.ts), [VALIDATION.md](app/VALIDATION.md).

## 10. Objava

- Inicijaliziran je Git repozitorij unutar direktorija `app`.
- Spremljena je provjerena verzija izvornog koda i poslana u privatni Sites repozitorij.
- Dodana je konfiguracija statičkog hostinga u `app/.openai/hosting.json`.
- Zapakirana je izgrađena aplikacija s podacima, dokumentima i vizualnim resursima.
- Spremljena je verzija 1 i uspješno dovršena privatna objava.

**Poveznica:** [Otvori aplikaciju](https://istra-proracun-2025.darko-etinger.chatgpt.site)

**Commit objavljene verzije:** `a7ceb5f44566e5a8a2809828c1a11a23428ae847`

## 11. Obuhvat i poznata ograničenja

- Prikaz je temeljen na godišnjem izvještaju za 2025.; ne povlači nove podatke uživo.
- Povezivanje stavki s tekstom obrazloženja zadržava postojeću metodu uparivanja.
  Dio stavki nema izravno upareno obrazloženje.
- Iznosi na karticama i grafovima zaokruženi su radi čitljivosti; izvornici i
  podatkovni izvozi ostaju dostupni za detaljan pregled.
- Funkcijske rashode, programske rashode i izdatke te kapitalne projekte treba
  uspoređivati uz njihov različit obuhvat, kako je označeno u aplikaciji.
- Objava je privatna; javni pristup nije uključen.
- Pregledničke provjere provedene su lokalno. Uspješna objava potvrđena je statusom
  servisa za hosting.


## 12. Prezentacijski redizajn vizualizacija

Naknadna dorada od 15. rujna 2026. pretvara naslovnicu u interaktivnu prezentaciju:

1. **Velika slika** — kružna raspodjela rashoda s odabirom namjene.
2. **Svakih 100 €** — ilustracija udjela kroz mrežu 100 obojenih polja.
3. **Plan i ostvarenje** — usporedne trake s objašnjenjem nakon klika.
4. **Ulaganja** — usporedba nabave nefinancijske imovine 2024. i 2025. te izvršenje plana.
5. **Rezultat godine** — odnos prihoda, rashoda, godišnje razlike i završnog viška.

- Novi vizualni smjer kombinira tamnu plavu, smaragdne naglaske, velike brojke, serifne naglaske naslova i animirane prijelaze poglavlja.
- Način prezentacije skriva glavnu navigaciju. Poglavlja imaju izravne gumbe, prethodno/sljedeće i upravljanje strelicama kada je prezentacija u fokusu.
- Poglavlje, odabrana funkcija i način prezentacije pamte se u URL-u.
- Detaljni rashodi sada nude tri prikaza: **Krug**, **Karta** i **100 €**. Svi koriste iste mjere, boje, odabir i detalje.
- Zajednički usporedni grafovi dobili su slojevite trake i klikabilno objašnjenje točne razlike između plana i izvršenja.
- Dorada uključuje stilove za manje zaslone, vidljiv fokus, najavu promjena i smanjene animacije prema sistemskoj postavci.
- Korištene su postojeće biblioteke React, D3 i Framer Motion; nisu dodane nove ovisnosti.

**Provjere:** produkcijska izgradnja, lint, usklađenost svih 10 funkcija kroz tri mjere i svih 1.601 programskih poveznica. Lokalni poslužitelj vraća HTTP 200. Pregledničke i vizualne provjere iz odjeljka 9 odnose se na prethodnu verziju i nisu ponavljane za ovaj redizajn.

**Glavne datoteke:** `app/src/pages/Naslovnica.tsx`, `app/src/components/AllocationChart.tsx`, `app/src/story.css`, `app/src/components/BudgetExplorer.tsx`, `app/src/components/BudgetExplorer.css`, `app/src/components/BarChart.tsx`.

**Objava redizajna:** verzija 2 uspješno je privatno objavljena na postojećoj poveznici. Commit: `187ef93c0684f07bdb5c7e67f4961b350cb01add`.

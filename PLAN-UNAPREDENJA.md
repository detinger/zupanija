# Plan unapređenja proračunskog portala

Datum pregleda: 11. listopada 2026.

Cilj: stranica za građane koja razumljivo objašnjava proračun i ima upečatljiv prikaz za prezentacije. Izvorni dokument je pregled i širi plan. Aktualni opseg, prema naknadnoj uputi korisnika, jest dizajn i animacija: bez karte Istre i bez procjena u danima. Dizajnerska dorada naslovnice i zajedničkog okvira implementirana je 11. listopada 2026.; ostali analitički prijedlozi ostaju ideje iz pregleda.

## Preporuka

Zadržati React, TypeScript, D3 i postojeću biblioteku za animacije. Prvo poboljšati podatkovnu pouzdanost i korisničku priču, zatim izraditi tri glavna prikaza: animiranu raspodjelu svakih 100 €, most do ukupnog rezultata i zumiranje kroz programsku hijerarhiju. Usporedbu 2024./2025. dodati ondje gdje postoje usporedivi podaci. Geografska karta isključena je iz opsega; tokovi po izvorima financiranja ostaju uvjetni prijedlog nakon proširenja podataka.

## Što je pregledano i potvrđeno

- Pregledani su React prikazi, komponente grafova, stilovi, JSON podaci, ekstrakcijske skripte i dokumentacija projekta.
- Postoje naslovnica s pet poglavlja, način prezentacije, prstenasti graf, karta udjela (treemap), mreža 100 €, usporedbe plana i izvršenja, programsko istraživanje, pretraga, izvozi i poveznice na PDF. Te funkcionalnosti treba nadograditi, a ne predstavljati kao nove.
- D3 se u aktivnim prikazima koristi za izračun kružnih segmenata i pravokutnika; React upravlja prikazom. Nekorištena komponenta `IcicleRow.tsx` uklonjena je tijekom završnog čišćenja.
- `npm run lint`, `node scripts/check-budget-explorer.ts` i `node scripts/check-program-tree.ts` prolaze. Provjereno je 10 funkcija, tri mjere, zbrojevi njihovih potkategorija i 1.601 jedinstvena poveznica na aktivnosti/projekte. Build je prošao nakon prethodnih terminoloških izmjena; kod aplikacije tijekom ovog pregleda nije mijenjan.
- Dodatna provjera 633 odnosa roditelj–djeca za izvršenje u programskoj hijerarhiji otkrila je jedno odstupanje. To nije obuhvaćeno postojećom provjerom poveznica.
- Početni pregled temeljio se na kodu. Nakon dizajnerske dorade proveden je vizualni pregled u Chromeu, uključujući mobilnu širinu 390 px i prezentacijski način; točan obuhvat i ograničenja opisani su u `app/VALIDATION.md`.

## Nalazi i prioriteti

| Prioritet | Nalaz | Predložena izmjena |
| --- | --- | --- |
| P0 | U razdjelu 006, glavi 00602, jedan zapis programa 2801 „Redovna djelatnost ustanova u kulturi” ima izvršenje 1.064.396,40 €, a njegove četiri aktivnosti zbrojeno 1.040.779,69 €. Razlika je 23.616,71 €. | Usporediti s XLSX/PDF izvornikom i utvrditi je li riječ o ekstrakciji ili samom izvoru. Ne raspoređivati razliku proizvoljno. Dodati provjeru svih razina i mjera prije povezanih prikaza. |
| P0 | `sazetak.json` sadrži zaglavlje „OPIS” i legendu „0” kao podatkovne retke; neka numerička polja sadrže tekst. Naslovnica konkretne iznose traži po nazivu, pa ovo samo po sebi ne potvrđuje pogrešno prikazan KPI. | Popraviti `parse_sazetak`, validirati tipove JSON-a i dodati stabilne oznake sažetnih redaka. |
| P1 | Priča prikazuje godišnju razliku prihoda i rashoda, dok ukupan rezultat pokazuje odvojeno. | Jednim mostnim grafom objasniti prijelaz od prenesenog rezultata do ukupnog rezultata. |
| Riješeno | Naslovnica je učitavala cijeli `programska.json` radi brojača. | Učitavanje i brojači uklonjeni su; detaljna hijerarhija učitava se u prikazima kojima je potrebna. |
| P1 | `narrative-programska.json` ima oko 2,41 MB, a pretraga oko 2,29 MB nekomprimirano. Indeks pretrage nastaje u glavnoj niti. | Izmjeriti na mobilnom uređaju. Obrazloženja podijeliti po razdjelu/programu; unaprijed pripremljen indeks ili Web Worker uvoditi prema mjerenju. |
| P1 | Programske poveznice koriste položaje u nizovima (`r/g/p/a`). | Uvesti stabilan složeni identifikator s godinom, razdjelom, glavom, korisnikom, programom i aktivnošću. Zadržati čitanje starih URL-ova. Same šifre programa nisu nužno jedinstvene. |
| P1 | Rezultat pretrage otvara razdjel iako zapis sadrži i oznaku programa. | Povezati rezultat s točnim programom/aktivnošću kad je identitet pouzdano utvrđen; jasno označiti širi rezultat kad nije. |
| P1 | Filtri kapitalnih projekata čuvaju se samo u stanju komponente. | Spremati filtre i poredak u URL, omogućiti dijeljenje odabranog pogleda i povratak na isti rezultat. |
| P1 | Smanjeno kretanje obrađeno je na naslovnici i u CSS-u; ostale animirane komponente nisu jednako pokrivene. | Ujednačiti pravila animacije, provjeriti tipkovnicu, dodir, čitljivost, fokus i čitače zaslona na svim novim prikazima. Zadržati postojeće tekstualne alternative grafovima. |
| P2 | `index.css`, `presentation.css` i `story.css` dijelom nadjačavaju iste komponente. Dio JSX-a je vrlo zgusnut. | Ujednačiti stilove, boje i razmake; razdvojiti priču od izračuna. Ukloniti neaktivne komponente i ovisnosti nakon provjere upotrebe. |
| P2 | Izvoz stupčastog grafa koristi zaseban skriveni SVG, pa izgled izvoza može odstupati od prikaza. | Izvoz temeljiti na zajedničkom modelu; uključiti naslov, godinu, mjeru, izvor i aktivne filtre. |

## Izbor biblioteke

| Opcija | Prednosti za ovaj projekt | Trošak i preporuka |
| --- | --- | --- |
| D3 + React + postojeće animacije | Precizna kontrola oblika, rasporeda, zumiranja i prijelaza. Postojeći kod već slijedi taj pristup. | Više ručnog rada na oznakama i interakcijama; najbolji izbor za glavne autorske prikaze. Zadržati. |
| Apache ECharts | Mnogo gotovih grafova i interakcija, Canvas/SVG prikaz, modularni uvoz. | Razmotriti ako opseg naraste na mnogo standardnih analitičkih prikaza. Dodavanje uz D3 zahtijeva usklađivanje izgleda i dodatno održavanje. |
| Recharts | Deklarativno slaganje uobičajenih React grafova. | Dobar kandidat za standardne poslovne grafikone; migracija postojećih nekoliko grafova nije prioritet niti sama donosi željeni autorski dojam. |
| visx | React komponente niže razine koje koriste D3 izračune. | Koristan ako se gradi veća zajednička biblioteka grafova; trenutačno ne opravdava prepisivanje. |

Arhitektonska odluka: D3 računa geometriju, React upravlja elementima, a jedna biblioteka animira njihove promjene. D3 i React ne trebaju neovisno mijenjati iste elemente. Učitavati samo potrebne module i mjeriti produkcijski paket; sam `import` iz `d3` nije dokaz da se korisniku šalje cijela biblioteka.

Službena dokumentacija: [D3 u Reactu](https://d3js.org/getting-started#d3-in-react), [ECharts mogućnosti](https://echarts.apache.org/en/feature.html), [modularni ECharts](https://echarts.apache.org/handbook/en/basics/import/), [Recharts](https://recharts.github.io/en-US/), [visx](https://github.com/airbnb/visx).

## Vizualizacije koje bih razvio

### 1. Animirana priča „Tvojih 100 € u proračunu”

Nadogradnja postojeće mreže i pet poglavlja. Na računalu graf ostaje uz tekst dok korisnik prolazi priču normalnim pomicanjem stranice. Istih 100 polja prelazi iz zajedničke mreže u skupine namjena; odabrano područje ostaje naglašeno i otkriva usporedbu te potkategorije. Na mobitelu se poglavlja slažu jedno ispod drugoga. Način prezentacije koristi iste podatke i korake, s ručnim napredovanjem i većim oznakama.

Učinak: gledatelj prati preobrazbu poznate cjeline i razumije udjele. Naslov i objašnjenje trebaju jasno reći da je riječ o svakih 100 € ukupnih rashoda, a ne obračunu osobno uplaćenog poreza. Kategorije manje od jednog polja ostaju u popisu s točnim udjelom. Ne blokirati normalno pomicanje stranice, ne vrtjeti animacije u petlji; omogućiti prikaz bez kretanja.

Podaci: postojeća funkcijska klasifikacija. Prioritet: prvi glavni prikaz.

### 2. Most do ukupnog rezultata (waterfall)

Vizualno povezati početni preneseni rezultat, prihode, rashode, primitke i izdatke s ukupnim rezultatom. Svaki korak dobiva oznaku i kratko objašnjenje na dodir ili fokus.

Jednakost u trenutačnom JSON-u, u eurima:

`29.442.587,86 + 220.478.380,84 − 229.579.222,36 + 8.413.881,16 − 4.660.998,41 = 24.094.629,09`

Graf koristiti s poštenom zajedničkom skalom. Zbog velikih prihoda i rashoda manji stupci trebaju izravne oznake i tekstualni sažetak. Na mobitelu prikazati korake vertikalno. Objasniti da ukupan rezultat ne označava automatski slobodna sredstva za nove projekte.

Podaci: postojeći sažetak, nakon čišćenja i provjere. Prioritet: visok; velika objašnjavajuća vrijednost uz umjerenu složenost.

### 3. Zumiranje kroz programe

Proširiti postojeći pregled programa zumirajućom kartom pravokutnika ili slojevitim trakama (icicle). Početni prikaz obuhvaća upravna tijela, a klik otvara glave, korisnike gdje postoje, programe i aktivnosti. Prijelaz ostavlja vidljiv put do cjeline. Dostupni su povratak, plan/izvršenje, iznos, udio i izvorno obrazloženje. Tekstualni popis ostaje alternativni prikaz, osobito na mobitelu.

Učinak: korisnik može krenuti od cijelog proračuna i nekoliko puta „ući” u podatke do konkretne aktivnosti. Koristiti stabilan raspored pri usporedbama i ne crtati svih 1.601 aktivnosti istodobno.

Podaci: postojeća programska hijerarhija nakon razrješenja odstupanja. Jasno navesti obuhvat „rashodi i izdaci”; ne poistovjećivati s ukupnim rashodima funkcijske klasifikacije. Prioritet: drugi veći razvojni korak.

### 4. „Što se promijenilo?”

Usporedba dviju točaka po namjeni za izvršenje 2024. i 2025., s razlikom u eurima i postotku. Poseban izbor prikazuje tekući plan 2025. prema izvršenju 2025. Sortiranje po apsolutnoj razlici ili relativnoj promjeni odgovara na različita pitanja. Omogućiti usporedbu dvije ili tri namjene na istoj skali.

Podaci za godišnju usporedbu postoje u funkcijskoj i ekonomskoj klasifikaciji; programski model nema izvršenje 2024. Porast rashoda sam po sebi ne označavati kao poboljšanje, niti niže izvršenje kao neuspjeh. Pri nultoj osnovici prikazati iznos i tekst, bez beskonačnih postotaka. Dvije godišnje vrijednosti nisu mjesečni trend.

Prioritet: visok nakon glavne priče; korisniji za usporedbu od dodavanja još jednog kružnog grafa.

### 5. Karta Istre — isključena iz opsega

Prema naknadnoj uputi korisnika, geografska karta nije potrebna. Fokus ostaje na profesionalnom dizajnu i animacijama postojećih podataka.

### 6. Tokovi sredstava (Sankey) — uvjetno proširenje

Široke trake mogu povezivati izvor financiranja s upravnim tijelom, programom i projektom. Klik izdvaja jedan tok; prikaz počinje malim brojem agregiranih čvorova i prikazuje detalje po odabiru.

Ključna ovisnost: `extract_xlsx.py` trenutačno izričito preskače grupiranje „Izvor” unutar aktivnosti. Ukupni iznosi po izvorima i zasebni iznosi po funkcijama nisu dovoljni za stvarne veze između njih. Proširiti ekstrakciju, sačuvati identitet izvora i provjeriti zbrojeve; ekonomske stavke različitih razina ne zbrajati dvaput. Funkcijske veze uključiti samo ako postoji provjereno preslikavanje.

Jednostavniji tok kroz postojeću programsku hijerarhiju može se napraviti ranije nakon usklađenja podataka, ali u prvoj verziji odabrao bih zumiranje: lakše prikazuje mnogo dugih naziva i radi na mobitelu.

## Aktualni opseg: dizajn i animacija

Korisnik je odabrao profesionalniji vizualni identitet i animacije nalik primjerima na Anime.js. Karta Istre nije potrebna. Procjene rada u danima povučene su iz plana.

Implementirano u ovoj doradi:

- Urednička kompozicija s novom tipografijom, svijetlim okvirom i tamnom površinom za podatke.
- Sto stalnih elemenata koji se animirano premještaju između kružnog rasporeda i mreže; odabir namjene, točni udjeli u popisu i napomena o zaokruživanju.
- Postupno otkrivanje naslova, promjene iznosa, animirane trake i stupci, oznaka aktivnog poglavlja te interakcije na gumbima.
- Obračun ukupnog rezultata kroz preneseni rezultat, prihode, rashode i neto financiranje.
- Mobilni raspored, prezentacijski način i podrška za smanjeno kretanje.
- Uklonjeno učitavanje pune programske hijerarhije s naslovnice, gdje je služila samo za brojače.

Postojeći Motion i D3 dovoljni su za ovu izvedbu; nije dodana još jedna biblioteka animacija. Izvorni podaci nisu mijenjani. Nalazi o ekstrakciji i zbrojevima iz prethodnog pregleda ostaju otvoreni i nisu prikriveni ovom vizualnom doradom.

## Kriteriji prihvata

- Svaki novi graf odgovara na jedno građaninu razumljivo pitanje; od iznosa je moguće doći do njegova obuhvata i izvora.
- Iznosi i udjeli slažu se s provjerenim izvorom do centa prije zaokruživanja. Nema dvostrukog zbrajanja roditelja i djece, rashoda i izdataka ili različitih klasifikacija.
- Nema izmišljenih veza, lokacija, vremenskih nizova ni pokazatelja dovršenosti projekata.
- Na 390 px i širokom zaslonu nema preklopljenih oznaka ni neželjenog pomicanja cijele stranice u širinu. Svaki graf ima jasan mobilni prikaz.
- Tipkovnica i dodir omogućuju sve bitne odabire; podaci ne ovise samo o boji ili prelasku mišem. Animacije poštuju smanjeno kretanje.
- Dijeljeni URL vraća odabir, mjeru i filtre; programske veze opstaju nakon promjene redoslijeda podataka.
- Mjeriti produkcijsku verziju na mobilnom profilu i postaviti početnu usporednu vrijednost. Optimizacije potvrđivati mjerenjem, ne samo veličinom izvornih datoteka.
- Postojeći build, lint i podatkovne provjere prolaze; proširene provjere pokrivaju otkrivene propuste. Na Netlifyju provjeriti osvježavanje izravnih ruta i stvarnu kompresiju podataka.

Prvu prezentaciju usmjeriti na put: „Kako se raspoređuje svakih 100 €?” → „Što se promijenilo?” → „Koji su programi iza iznosa?” → „Kako nastaje ukupan rezultat?”. To povezuje upečatljiv izgled sa sadržajem koji građanin može objasniti vlastitim riječima.

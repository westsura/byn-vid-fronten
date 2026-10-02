# Inventering – steg 0

Datum: 2026-10-02 · Underlag: `DESIGN.md` (2026-10-02) och repot vid commit `6706e91`.

Repot byggdes för en fransk by 1944 med tre spelargrupper mot tre fiendegrupper. Designen gäller nu en tysk pluton på östfronten 1943. Det här dokumentet beskriver vad som finns, vad som kan behållas och vad som behöver göras om. Ingen spelkod har ändrats i detta steg.

## 1. Vad som finns i dag

### Teknik

| Del | Nuläge |
|---|---|
| Stack | Vanlig JavaScript i ES-moduler, Canvas 2D, inget byggsteg. Allt som publiceras ligger i `dist/`. |
| Publicering | Vercel publicerar `dist/` vid varje push till `main` (https://byn-vid-fronten.vercel.app). |
| Tester | `npm test` kör `node --test`. 50 tester i 6 filer. De täcker grundflöde, byggnader, navigering, prototypstyrkor, grafikprov och gångcykel. |
| Verktyg | Python-skript med Playwright (Chromium) för skärmbilder och geometribilder i `scripts/`. |
| Storlek | Spelkod cirka 1 700 rader i `dist/src/`. Grafikprov cirka 25 MB i `dist/assets/prototype/`. Grafikunderlag och granskningar cirka 150 MB i `art/` och `docs/art/`. |

### Kod per del (`dist/src/`)

| Fil | Innehåll |
|---|---|
| `main.js` | Startar spelet, laddar grafikläge och kör bildrutsloopen. |
| `sim.js` | Hela striden: grupper, order, förflyttning, eld, moral, enkel fiende-AI, mål och vinst/förlust. Ingen DOM-åtkomst; gränssnittet lyssnar via `hooks`. Körs utan webbläsare i testerna. |
| `config.js`, `scenario.js` | Kartmått, speltid (6 min), hålltid (20 s), sex hus, skogar som cirklar, målområde och startpositioner. Allt är skrivet direkt i JavaScript. |
| `terrain.js` | Exakt väggeometri (rektanglar), dörrar och fönster, skydd per plats, siktlinje och platser inomhus. |
| `nav.js` | A* på ett rutnät med 10 enheter per ruta. Rutten förenklas från soldatens verkliga position. Stresstestad med 240 slumpade order och 0 fel. |
| `render.js`, `soldiers.js`, `art.js` | Kartbild, hus, mål, grupper och effekter. Soldaterna ritas antingen med kod eller med GPT:s sprites i valbara grafikprov. Gångcykel med fotlåsning finns. |
| `ui.js`, `index.html`, `style.css` | Sidopanel med gruppkort, orderpanel med porträtt, logg, resultatskärm, grafikväljare och märke för grafikprov. |
| `audio.js` | Syntetiserat skottljud, avstängt som standard. |
| `rng.js` | Seedad slumpgenerator, så att striden går att upprepa i tester. |

### Karta

- En målad bild på 1536 × 1024 pixlar av en fransk by: stenhus med skiffertak, häckar, stenmurar och åkrar.
- Spelvärlden är 1200 × 800 enheter, där 1 enhet är cirka 0,1 m.
- Sex hus har exakt geometri. Övriga murar och häckar är bara bild.
- Skogarna är cirklar som stämmer dåligt med bilden.
- Kartan ritas alltid i sin helhet, skalad till fönstret. Det finns ingen kamera och ingen zoom.

### Enheter

- **Standardläget:** tre egna grupper (Alfa, Bravo, Charlie) mot tre fiendegrupper (Nord, Öst, Syd), alla med 5 man.
- **Grafikproven:** styrkor från GPT:s paket. Den tyska gruppen har 10 man med MG-trupp 4 och Schützentrupp 6, där kulsprutan är MG34. Den sovjetiska gruppen har 11 man med eldelement 3 och manövergrupp 8, och har DP, en PPSj och två SVT-40. Spelaren väljer sida.
- **Datamodell:** soldaterna är objekt inuti gruppen (`squad.men[]`), med roll, vapen och titel. Det finns ingen person som lever vidare utanför gruppen och inga ledare med egna värden.

### Strid

- **Eld:** en gemensam eldgivning per grupp var 0,6–2 sekund. En slumpad skytt och ett slumpat mål med fri siktlinje väljs. Träff beror på avstånd, skydd och om skytten rör sig.
- **Moral:** ett enda värde per grupp. Det sjunker vid beskjutning och förluster och stiger långsamt.
  - Under 22 drar sig gruppen tillbaka. Över 48 hämtar den sig.
  - `underFire` gör gruppen liggande i 5 sekunder.
- **Ammunition:** en mätare per grupp.
- **Fiende-AI:** var 12:e sekund försvarar gruppen sig om spelaren är nära, annars går den mot målet.

### Order och kontroll

| Kontroll | Funktion |
|---|---|
| Klick på mark | Förflytta |
| Klick på hus | Gå in |
| D | Försvara |
| Mellanslag | Paus. Order kan ges i paus. |
| 1–3 | Välj grupp |
| Piltangenter och Enter | Ge order |

Det finns ingen halv hastighet, inget kryp, ingen delning av grupper och inga sektorer.

### Mål

Spelaren vinner genom att hålla gårdsplanen i 20 sekunder utan fiender inom 100 enheter. Tidsgränsen är 6 minuter.

### Grafikflödet med GPT

Det finns ett etablerat flöde och det fungerar:

1. Beställning (`docs/art/REQUEST_nnn.md`).
2. Paketet tas emot oförändrat (`art/incoming/`).
3. Paketet blir ett valbart prov (`?art=…`).
4. Granskning med skärmbilder (`docs/art/review/`).
5. Björn provspelar.

Björn har godkänt v4-stilen som grund. Det som finns i v4-stil:

- **Båda sidor:** gruppens alla roller i redo- och liggande ställning, och utslagna.
- **Tysk gevärsskytt:** gångcykel i lager.

## 2. Behålla, bygga om, ta bort

### Behålla

| Del | Skäl |
|---|---|
| Teknikstacken (ES-moduler, Canvas, inget byggsteg, Vercel) | Fungerar, är snabb (cirka 6 ms per bildruta med 63 soldater) och testbar. |
| Uppdelningen mellan simulering och gränssnitt (`sim.js` med `hooks`) | Tillståndsmodellen och hotkartan kan läggas i simuleringen och testas utan webbläsare. |
| `terrain.js` och `nav.js` | Exakt siktlinje och vägval behövs för hotkarta, sektorer och AI. Näten kan återanvändas. Navigeringens rutnät på 10 enheter kan bli hotkartans rutnät, eller ett grövre nät på 20 enheter. |
| Seedad slump, `step(dt)` med paus, testupplägget | Grund för paus, halv hastighet och upprepbara tester. |
| GPT:s sprites i v4-stil, lagerritning och fotlåsning | Tyska och sovjetiska figurer passar östfronten 1943 redan nu. |
| Grafikflödet och dokumenten i `docs/art/` | Används för kommande grafik: MG42, izbor och poser för nedhållen. |
| Kartbilden | Får användas i prototypen enligt DESIGN.md: "vilken by som helst". |

### Bygga om

| Del | Vad som ändras | Steg i PROMPTER |
|---|---|---|
| Enhetsdata | Från JavaScript och GPT:s rollistor till datafiler. Personer skilda från grupper. Pluton med plutonsledning och tre grupper. Giltighetsår per enhet. | 1 |
| Moral och `underFire` | Ersätts av nedhållning, sammanhållning och eldberedskap per grupp eller trupp, samt hotkarta och obehag. | 2 |
| Eldmodellen | Från slumpad gruppsalva till vapen × eldberedskap × skydd × nedhållning, med delbar grupp, MG42 och nedslag efter material. | 3 |
| Order, panel och kamera | Paus finns. Halv hastighet, fler order, kort per enhet med halvkort vid delning, tre zoomnivåer och kameraglidning är nytt. | 4 |
| Fiende-AI | Från timerstyrd till att använda hotkartan, sektorer och försvar av byggnaden. | 5, 8 |
| Mål och vinst | Från "håll gårdsplanen 20 s" till stridsdugliga soldater i en byggnad vid tidens slut. | 8 |
| Gruppkortet | Visar i dag moral och antal. Ska visa ledare, nedhållen eller bruten, och eldberedskap. | 4, 6 |
| Inomhusvisning | Soldater inne i hus ritas stående medan reglerna räknar dem som liggande. Bör följa tillståndsmodellen. | 2–3 |

### Ta bort eller byta ut

| Del | Åtgärd |
|---|---|
| Texten "NORMANDIE, 1944" och "SEKTOR 07 · SAINT-MARTIN" i `index.html` | Byts mot östfronten 1943 och ett fiktivt bynamn. Det görs i steg 1, när styrkorna byts, för att inte ändra spelkod i steg 0. |
| Gruppnamnen Alfa, Bravo och Charlie | Ersätts av 1., 2. och 3. Gruppe från datafilen. |
| Standardstyrkan med 5 man och de kodritade soldaterna i "allierad" oliv | Behövs inte när den tyska plutonen är grunden. Föreslås ligga kvar som reserv tills steg 1 är godkänt, och tas sedan bort. |
| Valet av sida (`&side=soviet`) | Designen har tysk sida. Föreslås tas bort i steg 1. Sovjetisk spelbar sida ligger utanför prototypen. |
| Äldre grafikprov (v1, v2, v3, v4, h2, s1, w1) | Föreslås tas bort ur spelet när steg 1 är godkänt. Kvar blir v4-figurerna med utslagna och gångcykel v2 som enda grafik. Historiken finns kvar i git och i `docs/art/review/`. |
| `ROADMAP.md` fas B–F | Ersätts av stegen i PROMPTER. Fas A, som är klar, behålls som historik. |

## 3. Förslag på mappstruktur för datafiler

Spelet har inget byggsteg, så datafilerna måste ligga under `dist/` för att kunna hämtas i webbläsaren. JSON passar: filerna läses med `fetch` i spelet och med `readFileSync` i testerna.

```
dist/data/
  weapons.json                 vapen: räckvidd, eldhastighet, magasin, ammunition, grundträff, nedhållning,
                               uppbyggnad av eldberedskap, pipbyte (MG42), giltighetsår
  units/
    de-schuetzenzug.json       tysk pluton: plutonsledning, gruppmall (gruppchef, ställföreträdare,
                               kulsprutetrupp skytt 1–3, skyttar), indelning i trupper, giltighetsår
    de-reinforcements.json     förstärkningar: extra grupp, tung kulsprutegrupp, granatkastargrupp 8 cm (steg 7)
    su-strelkovyj-vzvod.json   sovjetisk skyttepluton: grupper med DP och flera PPSj
  ranks/
    heer.json, waffen-ss.json, rkka.json
                               grader: namn, förkortning, Heer-motsvarighet, beteckning (text + bildfil),
                               giltighetsår (t.ex. Grenadier/Schütze, sovjetiska kragspeglar 1942 → axelklaffar 1943)
  awards/
    de.json, su.json           utmärkelser: namn, förkortning, klass/grad, krav, bärordning, bildfil
  text/
    en.json                    alla gränssnittstexter på engelska (menyer, order, tillstånd, värden, egenskaper,
                               loggmallar som "{rank} {name} rallies {unit}")
  people/
    de-roster-1943.json        personer: id, namn, grad, roll, vapen, status, ledarvärden och egenskap
                               (prototypens fasta kärna; senare kampanjens bestånd)
    leader-candidates.json     ledarkandidater med pris (steg 7)
  rules/
    state-model.json           nedhållning, sammanhållning, eldberedskap, hotkarta och obehag (steg 2)
    leader-traits.json         egenskaper och deras regeleffekter (steg 6)
  maps/
    village-1.json             kartbild, hus, dörrar, fönster, skydd per material, skogsområden,
                               utgångsområden (flyttas från scenario.js)
  scenarios/
    s01-motanfall.json         år, karta, kärna, budget, motståndare, uppgift, segervillkor, tid (steg 8)
```

- Gruppen refererar personer med id. Det håller isär person och grupp, vilket kampanjen kräver.
- En liten laddare (`dist/src/data.js`) läser filerna och kontrollerar dem: att id:n finns, att år stämmer och att värdena ligger inom gränserna. Testerna använder samma kontroll.
- Förband, befattningar, grader och utmärkelser ligger på originalspråk i data (tyska; sovjetiska i translitterering). Gränssnittet hämtar övrig text från `text/en.json`.
- Symboler (örn, hakkors i utmärkelser, SS-runor, röd stjärna) blir egna bildfiler, skilda från övrig grafik, enligt DESIGN.md (Symboler).
- GPT:s rollistor i `dist/assets/prototype/infantry-v1/*-squad.json` används inte längre som speldata. Grafiken knyts till roll och vapen i datafilerna.

## 4. Risker och frågor

**Motsägelser och oklarheter mellan DESIGN.md och PROMPTER.md**

1. **Pipbyte.** DESIGN.md räknar pipbyte till det som ligger *utanför* prototypen, men steg 3 i PROMPTER ska bygga det. Vilket gäller?
2. **Ytbekämpning** finns bland grundorderna i DESIGN.md, men både DESIGN.md och PROMPTER (steg 4 och 5) lägger den utanför prototypen. Jag utgår från att den inte byggs. Stämmer det?
3. **Gruppstorlek 1943.** DESIGN.md anger 1942 (fyra grupper om tio) och 1944 (tre grupper om nio), men inte 1943. PROMPTER steg 1 säger tre grupper. Hur många man per grupp gäller 1943? Mitt förslag är tio, med möjlighet till underbemanning per scenario.
4. **Kulspruta.** Designen och PROMPTER utgår från MG42. Den godkända tyska MG-skytten bär MG34. Ska GPT få en beställning på en MG42-figur, eller går MG34 bra i prototypen?
5. **Plutonsledning.** DESIGN.md har som öppen fråga om plutonsnivån ska ha en eller två ledare. PROMPTER steg 6 bygger två, plutonchef och Zugtruppführer. Jag utgår från två.

**Tekniska risker**

6. **Kamera och kartupplösning.** Steg 4 kräver zoomnivån "grupp". Dagens kartbild har bara 1,28 pixlar per enhet och blir suddig i nära zoom. Sprites håller (28 pixlar per enhet). Ett förslag på lösning finns i avsnitt 6.
7. **Kartstorlek (Björn 2026-10-02).** Kartan kan vara långt större än det spelaren ser, så trängseln löses med en större karta och en kamera som panorerar. En formation som vrids efter riktningen behövs ändå för liggande figurer, men den är inte längre en tidskritisk risk.
8. **Prestanda.** Hotkarta och siktlinjer för cirka 75 soldater kostar mer än dagens gruppsalvor. Planen är att uppdatera spritt över flera bildrutor, som designen anger, och mäta i varje steg. Dagens nivå är 6 ms per bildruta.
9. **Repots storlek.** `art/` och `docs/art/review/` är cirka 150 MB och `.git` cirka 140 MB, främst GIF-filer och ark. Det fungerar, men varje synk till Björns dator kräver uppdelade paket. Fråga: ska nya granskningsfiler (GIF) läggas utanför repot, till exempel bara skickas i chatten eller ligga i projektet?
10. **Kartan är fransk.** Designen vill ha izbor, raviner, kolchosbyggnader och en stenbyggnad. Prototypen får använda nuvarande by, men scenariot i steg 8 behöver en stenbyggnad som mål. Ett av dagens stenhus kan fungera tills vidare.

## 5. Plan framåt

Stegen följer PROMPTER 1–8 med avstämning efter varje steg. Med tanke på riskerna ovan föreslår jag följande inom stegens ramar:

- **Steg 1:**
  - lägg in datafilerna och laddaren;
  - byt texterna i `index.html`;
  - ta bort valet av sida och de äldre grafikproven efter godkännande;
  - placera styrkorna med befintliga v4-figurer som markörer.
- **Steg 2:** hotkartan på 20 enheters rutnät, med samma rutnät för obehag. Debugläget ritar över kartan.
- **Steg 3:** formationen vrids efter riktningen, eftersom den behövs för att kulsprutetruppen ska kunna fungera som eldbas.
- **Grafikbeställningar till GPT, parallellt och efter Björns beslut:**
  - pose för nedhållen;
  - MG42, om fråga 4 kräver det;
  - skarpare karta eller izba-by, om fråga 6 och 10 kräver det.

## 6. Skarp karta i alla zoomnivåer (förslag, väntar på beslut)

En enda målad bild räcker inte för både en stor karta och skärpa vid gruppnivån. Ett exempel: en karta på 2400 × 1600 enheter med 8 pixlar per enhet (gruppnivå på retinaskärm) blir 19 200 × 12 800 pixlar. Det är för stort för en bild i webbläsaren och för tungt att ladda.

**Alternativ A – stor målad bild i rutor (tiles) med flera upplösningar**

- Kartan målas som i dag men i hög upplösning och delas i rutor. Spelet laddar bara de rutor som syns, i den upplösning zoomnivån kräver.
- **Fördel:** samma målade helhetsintryck som i dag.
- **Nackdel:** varje karta blir ett mycket stort målningsjobb. Geometrin (väggar, skydd) måste fortfarande ritas in separat och hållas i fas med bilden, vilket är det problem vi har i dag med häckar och skog.

**Alternativ B – kartan byggs av delar (rekommenderas)**

- Marken består av sömlösa marktexturer (gräs, lera, väg, åker, snö), till exempel 512 × 512 pixlar som upprepas. En grov terrängkarta anger vilken mark som ligger var, och övergångarna blandas mjukt.
- Hus, izbor, staket, träd, buskar, ravinkanter och stenbyggnader är egna sprites med 28 pixlar per enhet, som soldaterna. De ritas skarpt i alla zoomnivåer.
- Kartan blir en datafil (`dist/data/maps/…json`) som placerar delarna. Samma fil ger geometri för väggar, skydd och siktlinje. Grafik och regler kan alltså inte glida isär.
- Nya kartor per scenario blir mest ett placeringsjobb, och GPT:s grafik återanvänds. Det passar designens "kartor anpassas per scenario".
- **Nackdel:** kräver en uppsättning grundgrafik först, och helheten blir mindre "målad" om inte marken får variation (fläckar, slitage, skuggor från objekt).

**Gäller båda**

- Canvas ritas med skärmens pixeltäthet (`devicePixelRatio`), vilket också rättar dagens suddighet på retinaskärmar.
- Vid översiktsnivån används förminskade versioner, så att kartan inte flimrar.
- Kartgrafiken påverkar inte steg 1–3. Kameran byggs i steg 4, och en första testkarta kan byggas med dagens bild som mark tills grafiken finns.

## 7. Björns beslut 2026-10-02

| Fråga | Beslut |
|---|---|
| Pipbyte | Byggs i prototypen (steg 3). DESIGN.md uppdaterad. |
| Ytbekämpning | Inte i prototypen. |
| Gruppstorlek 1943 | Tre grupper om tio man; scenarier kan underbemanna. DESIGN.md uppdaterad. |
| Kulspruta | MG34 i prototypen, både som figur och som vapen i datan. Pipbyte gäller MG34. DESIGN.md uppdaterad. |
| Plutonsledning | Två ledare: plutonchef och Zugtruppführer. DESIGN.md uppdaterad. |
| GIF-filer | Oanvända GIF-filer är borttagna ur repot (cirka 58 MB). Nya GIF-filer skickas bara i chatten; `.gitignore` stoppar `*.gif`. |
| Kartstorlek | Kartan kan vara större än skärmbilden; kameran panorerar (se risk 7). |
| Skarp karta | Två alternativ i avsnitt 6. Väntar på val. |

Repots historik (`.git`) innehåller fortfarande de borttagna GIF-filerna. Den krymper bara om historiken skrivs om och tvingas upp till GitHub, vilket inte är gjort.

## 8. Nya delar i DESIGN.md sedan inventeringen skrevs

DESIGN.md uppdaterades i designchatten 11:08–11:17 med:

- språkregler;
- ledarkort;
- grader, gradbeteckningar och utmärkelser för Heer, Waffen-SS och Röda armén;
- symboler.

Vid 11:23 skrev Claude Code av misstag över den versionen med en äldre version plus besluten från steg 0. Den senaste versionen är återställd ord för ord från designchatten, och besluten från steg 0 är införda ovanpå (12:00 ungefär).

Det här påverkar planen:

| Ändring i designen | Följd för koden |
|---|---|
| Gränssnittet på engelska; förband, befattningar, grader och utmärkelser på tyska respektive i rysk translitterering | Dagens svenska texter i `index.html` och `ui.js` byts mot engelska. Alla texter flyttas till `dist/data/text/en.json`. Gruppnamn blir "1. Gruppe" och "1-ye otdeleniye". Görs i steg 1, eftersom styrkorna och namnen byts då. |
| Personer har formation, grad, befattning och utmärkelser | Datamodellen i steg 1 får dessa fält från början, med datafiler för grader och utmärkelser (avsnitt 3). |
| Meniga heter Grenadier 1943 och Schütze 1942 | Gradnamnet hämtas från gradtabellen efter scenariots år. Rollnamnet MG-Schütze är oförändrat. |
| Röda armén bytte till axelklaffar i januari 1943 | Beteckningen hämtas efter år. Prototypen (1943) visar axelklaffar. |
| Ledarkort med porträtt eller siluett, gradbeteckning och utmärkelsesikoner | Kräver grafik: axelklaffar och kragspeglar, utmärkelseikoner och eventuellt porträtt. Det är en grafikbeställning före steg 7. Porträtt eller siluett är en öppen fråga i designen. |
| Symboler visas historiskt korrekt, som separata bildfiler | Ikoner för utmärkelser och emblem levereras med symbolen som eget lager eller egen fil, så att en variant utan symboler kan byggas. Det gäller kommande grafikbeställningar. Dagens soldatfigurer sedda ovanifrån visar inga emblem. |
| PROMPTER.md anger MG42 i steg 1 och 3 | Enligt Björns beslut används MG34 i prototypen. Jag läser "MG42" i prompterna som gruppens kulspruta, alltså MG34 i datan. Pipbyte gäller den. |


# REQUEST_001 – Referenspaket: en soldat, ett hus, ett gruppkort

Paket: `REQUEST_001` · version 1 · 2026-09-29
Beställare: Björn · Teknisk specifikation: Claude · Utförare: GPT

Läs `ART_BRIEF.md` först. Den innehåller koordinatsystem, skala, filformat, lager och leveransformat. Här står bara det som gäller för det här paketet.

## Syfte

Paketet ska skapa en gemensam **kvalitetsreferens** för resten av spelet. Tre saker ska tas fram och provas i spelet innan något större beställs:

1. **En infanterisoldat.** Stilen för alla soldater, med en färgriktning för fienden.
2. **Ett hus.** Västra huset (hus 0), med separat tak och interiör som exakt följer spelets geometri.
3. **Ett gruppkort.** Designen för sidopanelens gruppkort, levererad som riktiga gränssnittskomponenter.

Små leveranser är bättre än många. Hellre en soldat som fungerar i spelet än tjugo animationsrutor som inte gör det.

## Bifogat underlag

| Fil | Innehåll |
|---|---|
| `ART_BRIEF.md` | Gemensamt underlag |
| `geometry/village.json` | Spelets geometri: hus, dörrar, fönster, soldatplatser, skog och mål |
| `reference/screen-1366x768-battle.jpg`, `-1500x1000-`, `-1920x1080-` | Spelet i dag vid tre skärmstorlekar |
| `reference/canvas-native-battle.jpg` | Kartytan i exakt 1 px per spelenhet |
| `reference/geometry-overview.jpg` | Hela kartan med rutnät (100 enheter), väggar, dörrar, fönster, skog och mål |
| `reference/house0-geometry-5x.png` | Hus 0 i 5 px/enhet med mått, väggband, dörr, fönster och soldatplatser |
| `reference/house0-map-crop-5x.jpg` | Hus 0 så som det ser ut i kartbilden i dag, utan markeringar |
| `reference/canvas-house0-occupied.jpg` | Dagens tillfälliga interiörvy när gruppen Alfa är inne i hus 0 |
| `reference/soldiers-1x.png`, `soldiers-4x.jpg` | Nuvarande soldater i alla ställningar, båda sidor, på fyra underlag |
| `reference/panel-squads-current.png`, `panel-sidebar-current.png` | Nuvarande gruppkort och sidopanel |

---

## Del 1 – Soldat

**Leverans**

| Fil | Krav/förslag | Beskrivning |
|---|---|---|
| `soldier-rifleman-v1.svg` | **KRAV** | Egen gevärsskytt, lagerindelad (se nedan) |
| `soldier-rifleman-enemy-v1.svg` | **KRAV** | Samma soldat i fiendens färger, med de formskillnader som föreslås |
| `concept-soldier-sheet-v1.png` | **KRAV** | Referensark som visar alla tillstånd för båda sidor, förstorat, på gräs, väg, plöjd åker och tät vegetation (jämför med `reference/soldiers-4x.jpg`) |
| `concept-soldier-motion-v1.png` | FÖRSLAG | Referens för gång- och krypcykeln: 4–8 ställningar i följd |

**Tekniska krav för SVG (KRAV)**

- `viewBox="-18 -12 48 24"`. Origo (0,0) = mitten av torson/axlarna. Soldaten är vänd åt +x (höger).
- Proportionerna ska ligga nära dagens soldat så att skalan i spelet stämmer:
  - hjälmens mitt ≈ (3, −1), radie ≈ 4,5
  - axelbredd ≈ 10
  - geväret från x ≈ 4 till x ≈ 19, på y ≈ 2
  - stående fötter till x ≈ −12
  - liggande ben till x ≈ −17
- En `<g>` per tillstånd, med dessa id: `ready`, `walk-a`, `walk-b`, `prone`, `crawl-a`, `crawl-b`, `fire`, `fallen`.
  - Varje tillstånd ska för sig ha lagren `shadow`, `legs`, `torso`, `equipment`, `head`, `weapon`, i den ordningen nerifrån och upp.
  - Delar som är gemensamma för flera tillstånd får återanvändas med `<use>`.
  - `walk-a` och `walk-b` är ytterlägena i gångcykeln: vänster respektive höger ben fram. Spelet interpolerar mellan dem.
- Mynningsflamman läggs som eget lager `muzzle-flash` i `fire`, framför mynningen (x > 19), riktad framåt.
- Gruppchefen ska ha en liten, diskret markering (lager `leader-mark`) som går att slå av och på.
- Ange fyllnadsfärger som vanliga hex-värden, utan gradienter som bygger på `id` från andra filer, utan filter och utan inbäddade bilder. Då kan Claude översätta figuren till canvaskod.
- Konturen ska vara mörk (ungefär `#22291d`), 1–1,5 enheter tjock, och bära kontrasten mot ljust underlag.
- Högst 30 kB per fil.

**Visuella krav**

- **KRAV**: soldaten ska gå att urskilja på alla fyra underlagen i `reference/soldiers-1x.png` vid spelets verkliga storlek (≈ 22 × 16 skärmpixlar utan gevär vid normal zoom). Det är den viktigaste punkten.
- **KRAV**: stående och liggande ska skilja sig i siluetten, inte bara i benen. Liggande ska se lägre och mer utsträckt ut.
- **KRAV**: utslagen soldat ska läsas som utslagen på avstånd, utan blod eller detaljerade skador. En hopsjunken form, ett gevär som ligger bredvid och en blekare ton räcker.
- **KRAV**: egna soldater i oliv och khaki, fienden i fältgrått, med minst en skillnad i form, till exempel hjälmens form eller hur utrustningen sitter.
  - Använd **inga verkliga emblem, gradbeteckningar eller nationella symboler**.
- FÖRSLAG: något ljusare axlar och hjälmkant, som ”kantljus”, för bättre kontrast mot mörk vegetation.
- FÖRSLAG: en ljus, halvgenomskinlig markering för vald grupp. Den ritas av spelet och behöver inte finnas i SVG-filen.

---

## Del 2 – Västra huset (hus 0)

**Låst geometri (KRAV)**, från `geometry/village.json`, hus `id: 0`

| Del | Värde i spelenheter |
|---|---|
| Ytterväggarnas kant (footprint) | x 444–559, y 120–219 (115 × 99) |
| Väggtjocklek i bilden | ≈ 6 inåt från kanten. Kollisionen går från 3 utanför till 6 innanför |
| Dörr | Södra väggen (y = 219), x **491–529**. Ska vara en tydlig öppning i väggen |
| Fönster, norr | y = 120, x 485,5–517,5 |
| Fönster, väster | x = 444, y 153,5–185,5 |
| Fönster, öster | x = 559, y 153,5–185,5 |
| Fönster, söder | Överlappar dörren; den södra öppningen ritas som dörr (x 491–529) |
| Soldaternas platser inne | (501,5 136), (460 169,5), (543 169,5), (501,5 202), (486,5 181,5). Håll dem fria från föremål som ser ut att blockera |

- Grafiken får **inte** visa en dörr eller ett fönster där spelet har en solid vägg, och inte heller en solid vägg där spelet har en öppning.
- Behöver den visuella utformningen en annan placering, skriv förslaget i `INTEGRATION.md`. Geometrin ändras bara efter beslut och test.

**Leverans**

| Fil | Krav/förslag | Bildstorlek | Innehåll |
|---|---|---|---|
| `bldg-house0-interior-v1.png` | **KRAV** | **524 × 460 px** | Golv, ytterväggar i genomskärning med öppningar, innerväggar och möblering. Genomskinligt utanför ytterväggarna, utom trappsten vid dörren |
| `bldg-house0-roof-v1.png` | **KRAV** | **524 × 460 px** | Tak rakt ovanifrån. Täcker minst hela rektangeln; takfot och skorsten får gå ut i marginalen |
| `concept-house0-overview-v1.png` | **KRAV** | fritt | Tak, interiör och båda ovanpå kartutsnittet, sida vid sida |

- Båda bilderna täcker världsrutan **x 436–567, y 112–227** (131 × 115 enheter, 8 enheters marginal runt huset) i **4 px/enhet**.
- Pixel (0,0) = världskoordinat (436, 112). Därmed ligger husets kant på pixel x 32–492 och y 32–428, och dörren på pixel x 220–372 vid y 428.
- Taket ska passa den befintliga kartan:
  - Samma skiffertak, färgtemperatur, ljus och skuggriktning som i `reference/house0-map-crop-5x.jpg`. Utgå från ljuset i kartbilden.
  - Den befintliga målade tillbyggnaden i sydost (ungefär x 519–553, y 172–212) får behållas eller förenklas, men ska ligga inom rektangeln.
- Interiören ska vara ljusare än taket och tydligt se ut som ”inomhus”: plankgolv eller stengolv. Då syns soldaterna tydligt ovanpå.
- Interiören får inte ha egna skuggor som liknar väggar där det inte finns väggar.
- FÖRSLAG: rita fönsteröppningarna som en mörk springa i väggen med ljusare karm. Det ska synas vilka väggpartier man kan skjuta genom.

**Så visas det i spelet** [PLANERAT i samband med integrationen]

1. Kartbasen ritas som i dag, med huset målat.
2. Taket ritas ovanpå, över soldaterna.
3. När en egen soldat går in tonas taket ned till cirka 15 % på 0,25 s, och interiören syns under.

---

## Del 3 – Gruppkort

Nuläge: se `reference/panel-squads-current.png`. Kortet är ett `<button class="squad">` i sidopanelen, cirka 300 px brett. Tre kort visas i en kolumn.

**Innehåll som kortet ska kunna visa** (data som finns i spelet i dag)

| Fält | Värden |
|---|---|
| Nummer och namn | 1–3; Alfa, Bravo, Charlie |
| Styrka | levande/5, t.ex. ”4 / 5” |
| Order och tillstånd | Avvaktar, Förflyttar, Försvarar, Går in i …, Drar sig tillbaka, Utslagen |
| Moral | 0–100 och text: Stabil (≥ 55), Pressad (25–54), Bruten (< 25) |
| Ammunition | 0–100 % *(visas i dag bara i orderpanelen; ska in på kortet)* |
| Beskjutning | nedtryckt ja/nej |
| Plats | terrängskydd eller husets namn, t.ex. ”Västra huset” |

**Tillstånd som ska designas (KRAV)**

1. Normal.
2. Hover.
3. Vald.
4. Tangentbordsfokus med synlig fokusring.
5. Varning: minst en av pressad moral, låg ammunition (< 25 %), nedtryckt.
6. Allvarlig varning: bruten moral eller drar sig tillbaka.
7. Inaktiverad: gruppen utslagen.

Varning får inte synas enbart genom färg (**KRAV**). Använd också form, ikon eller textmarkering. Varningen ska vara återhållsam, inte blinkande eller skrikig.

**Leverans**

| Fil | Krav/förslag | Innehåll |
|---|---|---|
| `ui-squad-card-v1.html` | **KRAV** | En fristående HTML-fil med CSS som visar alla sju tillstånden sida vid sida |
| `ui-squad-card-v1.png` | **KRAV** | Skärmbild av HTML-filen, för godkännande |
| `ui-icons-v1.svg` | FÖRSLAG | Små ikoner för ammunition, nedtryckt och moral. 24 × 24, `currentColor` |

- Använd den befintliga strukturen där det går: `.squad`, `.squad-top`, `.number`, `.count`, `.squad-bottom`, `.morale`, `.selected`.
- Nya klasser får läggas till, till exempel `.warn`, `.critical` och `.ammo`.
- Använd CSS-variablerna i `ART_BRIEF.md` (F). Ändrade färger redovisas som ändrade variabelvärden.
- Ingen text eller siffra får bakas in i bilder.
- Kortet ska fungera i bredderna 240–320 px.
- Typsnitt: `system-ui` om inget annat föreslås. Ett föreslaget typsnitt ska ha fri licens och anges med källa. Björn godkänner.

---

## Leverans och godkännande

Leverera enligt `ART_BRIEF.md`, avsnittet om leveransformat: mappen `REQUEST_001-v1/` med filerna ovan samt `overview.png`, `INTEGRATION.md` och `manifest.json`.

**Paketet godkänns när:**

1. Alla KRAV-filer finns, har rätt namn och rätt mått. Rasterbilderna är 524 × 460 px med ren alfakanal.
2. SVG-filerna har `viewBox="-18 -12 48 24"`, origo i torsons mitt och alla tillstånd och lager enligt listan.
3. I spelet vid normal zoom går soldaterna att urskilja på alla fyra underlagen. Stående, liggande och utslagen går att skilja åt; egna och fiender går att skilja åt. Claude tar skärmbilder för kontroll.
4. Husets dörr och fönster ligger inom **2 spelenheter** från geometrin. Soldaterna står synligt inne i huset när taket är nedtonat.
5. Taket passar mot kartan runt omkring utan synlig kant eller avvikande ljus.
6. Gruppkortets sju tillstånd går att skilja åt även i gråskala. Fokusringen syns.
7. Björn godkänner den visuella riktningen efter provspelning.

Avvikelser från specifikationen redovisas i `INTEGRATION.md` med skäl och förslag. Det är bättre än att leverera något som ser rätt ut men inte passar.

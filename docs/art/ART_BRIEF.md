# Byn vid fronten – grafiskt underlag (ART_BRIEF)

Version 1 · 2026-09-29 · underhålls av Claude (utveckling) · godkänns av Björn (beställare)

Det här dokumentet är det gemensamma tekniska och visuella underlaget för all grafik till spelet. Det ska gå att läsa utan tillgång till tidigare konversationer. Varje enskild beställning (t.ex. `REQUEST_001.md`) hänvisar hit och lägger bara till det som är specifikt för paketet.

Markeringar i texten:

- **[STÖDS]** finns i spelet i dag (version `main`, commit 4cf4b07 eller senare).
- **[PLANERAT]** ska byggas, och formatet nedan gäller redan nu.
- **[EJ BESLUTAT]** är öppet. Ett standardval föreslås och gäller tills något annat bestäms.
- **KRAV** måste uppfyllas för att en leverans ska kunna integreras. **FÖRSLAG** är en rekommendation.

---

## A. Spelet och den visuella riktningen

**Spelet.** Taktiskt infanterispel i realtid för webbläsare, inspirerat av klassiska *Close Combat*. Spelaren leder tre infanterigrupper (Alfa, Bravo, Charlie) om fem soldater var. Man kan pausa och ge order. Sikt, skydd, beskjutning och moral avgör striden. Soldaterna agerar individuellt inom gruppens order.

**Miljö.** Fransk by i Normandie sommaren 1944, den fiktiva operationen *Morgonljus*. Sex hus, grusvägar, stenmurar, häckar, fruktträd, åkrar och ängar. Spelaren kommer västerifrån, och fienden försvarar byn.

**Perspektiv.** Rakt ovanifrån (ortografiskt, 90°). Ingen isometri och ingen snedvy. Tak ses rakt uppifrån. Soldater ses uppifrån som hjälm, axlar, ryggsäck och gevär.

**Kamera.** [STÖDS] Hela kartan visas samtidigt och skalas med fönstret. [PLANERAT] Zoom och panorering (se B).

**Detaljnivå.** Detaljerad och jordnära terräng, som i den nuvarande målade kartan. Soldaterna ska vara enklare och tydligare än terrängen: läsbarheten går före detaljerna.

**Det som ska bevaras från prototypen**

- Kartans målade, naturalistiska stil och dämpade, varma jordtoner (se `reference/geometry-overview.jpg`).
- Soldaternas grundform: hjälm, axlar, ryggsäck, remmar och gevär framåt, sedda uppifrån, med mörk kontur och mjuk skugga (se `reference/soldiers-4x.jpg`).
- Sidornas färgskillnad: egna i olivgrönt och khaki, fienden i fältgrått och blågrått.
- Det återhållsamma militära gränssnittet: mörkt grönsvart, tunna linjer, versaler med spärrning för rubriker och en sandfärgad accent.

**Riktlinjer**

- Dämpade färger. Inga mättade primärfärger utom för små, avsiktliga signaler (mynningsflamma, varning).
- Soldater ska gå att urskilja mot gräs, väg, plöjd åker och tät vegetation. Det är den svåraste kontrasten i dag.
- Tydliga silhuetter och kroppsställningar. Stående, liggande och utslagen ska gå att skilja åt på formen, inte bara på färgen.
- All grafik är egen. Kopiera inte grafik, logotyper eller karaktärer från *Close Combat* eller andra spel. Använd dem bara som referens för känslan.

---

## B. Koordinater, skala och kamera

**Spelvärlden** [STÖDS]

| Egenskap | Värde |
|---|---|
| Koordinatsystem | Origo uppe till vänster, x ökar österut (höger), y ökar söderut (nedåt) |
| Kartans logiska storlek | 1200 × 800 spelenheter |
| Skala (konvention) | 1 spelenhet ≈ 0,1 m, så kartan är ungefär 120 × 80 m |
| Navigationsrutnät | 20 × 20 enheter per ruta (60 × 40 rutor) |
| Vinklar | Radianer. 0 = öster, π/2 = söder (medurs i bild, eftersom y går nedåt) |

**Storlek på objekt i spelvärlden**

| Objekt | Storlek i spelenheter | Kommentar |
|---|---|---|
| Hus | 104–134 × 89–115 (hus 0 är 115 × 99) | Ungefär 10–13 m, rimligt för ett franskt bondhus |
| Soldat, stående, utan gevär | ≈ 22 lång × 16 bred | **Avsiktligt överdriven**, ungefär 2× verklig storlek, för läsbarheten |
| Soldat, stående, med gevär | ≈ 35 lång | Geväret pekar i riktningen soldaten är vänd åt |
| Soldat, liggande | ≈ 40 lång inklusive gevär | |
| Väg | ≈ 35–45 bred | |
| Avstånd mellan soldater i en grupp | ≈ 20 i sidled, 23 i djupled | |

[EJ BESLUTAT → standardval] Soldaternas överdrivna storlek (≈ 2×) behålls. Den är avgörande för läsbarheten vid normal zoom.

**Bildens upplösning jämfört med objektets storlek.** Håll isär dessa två saker.

- Ett objekts *storlek* anges alltid i spelenheter och är låst.
- En bilds *upplösning* anges i bildpixlar per spelenhet (px/enhet). Samma objekt kan levereras i högre upplösning utan att storleken i spelet ändras.
- Nuvarande kartbild `map.png` är 1536 × 1024 px för 1200 × 800 enheter, alltså **1,28 px/enhet**.

**Skärm och zoom**

- [STÖDS] Kartan skalas med fönsterbredden. Mätt: 0,83 skärmpixlar per enhet vid 1366 × 768, 0,93 vid 1500 × 1000 och 1,18 vid 1920 × 1080. Detta motsvarar i dag "normal zoom".
- [PLANERAT] Zoom från **0,75 till 2,0** CSS-pixlar per enhet, där 1,0 är normal zoom. Retinaskärmar dubblar antalet fysiska pixlar.
- [PLANERAT] Skärpa på högupplösta skärmar (devicePixelRatio). I dag ritas kartan i 1200 × 800 och blir något suddig på retinaskärmar.

**Upplösning att leverera i (KRAV)**

- Detaljerade objekt (soldater, hus, tak, interiörer) levereras i **4 px/enhet**. Det täcker största zoom (2,0) gånger retina (2).
- Rastergrafik skalas ned av spelet med bilinjär filtrering. Pixelart används inte.
- [PLANERAT, ej i första paketet] En ny kartbas i minst 2,5 px/enhet (3000 × 2000 px).

---

## C. Grafiska format

| Tillgångstyp | Format | Upplösning | Transparens | Referenspunkt | Destination efter godkännande |
|---|---|---|---|---|---|
| Soldat (källa) | **SVG**, lager som `<g id="…">` | Vektor. `viewBox` i spelenheter enligt E | Ja | Soldatens origo = torsons mitt (0,0) | `art/source/soldiers/` |
| Soldat (raster, om det behövs) | PNG-32 | 4 px/enhet | Ja, raka kanter utan färgfransar | Som ovan | `dist/assets/soldiers/` |
| Hus: tak | PNG-32 (eller WebP med alfa) | 4 px/enhet | Ja utanför taket | Övre vänstra pixeln = angiven världskoordinat | `dist/assets/buildings/` |
| Hus: interiör | PNG-32 | 4 px/enhet | Ja utanför ytterväggarna | Som ovan | `dist/assets/buildings/` |
| Kartbas | JPEG eller WebP (ingen alfa) | ≥ 2,5 px/enhet | Nej | (0,0) | `dist/assets/maps/` |
| Ikoner i gränssnittet | SVG, `currentColor` | 24 × 24 viewBox | Ja | – | `dist/assets/ui/` |
| Typsnitt | WOFF2 med fri licens (t.ex. SIL OFL) | – | – | – | `dist/assets/fonts/` |

**Filnamn (KRAV).** Gemener, bindestreck och ingen å/ä/ö: `<typ>-<objekt>-<variant>-v<version>.<ext>`, till exempel `bldg-house0-roof-v1.png` eller `soldier-rifleman-v1.svg`.

**Marginal.** Rasterbilder får ha en genomskinlig marginal för skugga eller takfot. Marginalen ska ingå i den angivna rutan så att referenspunkten stämmer.

**Budget** [FÖRSLAG]

- Ett hus med tak och interiör: högst 600 kB tillsammans.
- En soldat-SVG: högst 30 kB.
- Hela spelet laddas i dag med cirka 4,1 MB, varav 4 MB är kartbilden.

**Konceptbild eller speltillgång.** En konceptbild visar stil och är inte en färdig tillgång. En speltillgång uppfyller måtten ovan exakt. Märk konceptbilder med `concept-` i filnamnet.

---

## D. Kartor och byggnader

**Kartlager**

| Lager | Ritordning | Påverkar spelreglerna | Status |
|---|---|---|---|
| Kartbas (mark, vägar, vegetation, målade hus och tak) | 1 | Nej, rent visuellt | [STÖDS] `map.png` |
| Lätt mörk ton över hela kartan | 2 | Nej | [STÖDS] |
| Husinteriörer (visas när egna soldater är inne) | 3 | Nej, visuellt | [STÖDS] som kodritad ersättare. [PLANERAT] som bild |
| Markeringar: räckviddscirkel, mål | 4 | Nej | [STÖDS] |
| Soldater, gruppetiketter och moralstreck | 5 | – | [STÖDS] |
| Tak (över soldater som står intill husen) | 6 | Nej | [PLANERAT], se nedan |
| Effekter: skott och ordermarkering | 7 | – | [STÖDS] |
| Pausslöja och tangentbordsmarkör | 8 | – | [STÖDS] |

**Spelreglernas geometri** [STÖDS] finns i koden (`dist/src/scenario.js`, `dist/src/terrain.js`) och exporteras till `geometry/village.json` med `node scripts/export-geometry.mjs`. Grafiken anpassas efter geometrin, aldrig tvärtom utan ett uttryckligt beslut.

- **Hus** är rektanglar (`footprint`). Hela ytan innanför väggarna ger skyddsvärde 0,78 (0 = inget skydd, 1 = fullt).
- **Väggar** är ett band längs rektangelns kanter, från **3 enheter utanför till 6 enheter innanför** kanten. De stoppar rörelse, sikt och skott. Den ritade väggen bör alltså ligga på kanten och vara cirka 6 enheter tjock inåt.
- **Dörrar.** I dag har varje hus exakt en dörr, mitt på södra väggen, 38 enheter bred. Dörren släpper igenom rörelse, sikt och skott.
- **Fönster** sitter mitt på varje vägg och är 32 enheter breda. De släpper igenom sikt och skott, men inte rörelse.
  - Obs: på södra väggen överlappar fönstret dörren, så i praktiken är hela södra öppningen en dörr.
- [PLANERAT] Varje hus ska få en egen lista över dörrar och fönster med fria positioner. Då kan geometrin följa kartbilden i stället för en fast mall. Formatet i `village.json` är redan förberett för det (`doors[]`, `windows[]`). Ändrad geometri beställs och testas uttryckligen.
- **Skog** är i dag cirklar (skyddsvärde 0,55) som ger skydd men inte skymmer sikt och inte påverkar hastigheten.
  - Obs: cirklarna stämmer dåligt med kartbilden. De ska ersättas av polygoner (planerat, fas B).
- **Stenmurar, häckar och åkrar** som syns i kartbilden simuleras **inte** i dag. [PLANERAT, fas B] De ska bli geometri för skydd, sikt och hastighet. Tills dess är de dekoration.

**Tak och interiör**

- [STÖDS] När en egen soldat befinner sig i ett hus ritar spelet en enkel planritning ovanpå kartbilden: golvplankor, ljus vägg, mörka fönstermarkeringar, dörr och husets namn.
- [PLANERAT] Varje hus får två bilder i exakt samma ruta:
  - `interior`: golv, innerväggar, möblering, dörr- och fönsteröppningar.
  - `roof`: taket sett uppifrån.
- Taket ritas ovanpå soldaterna och tonas ned till cirka 15 % synlighet på 0,25 s när en egen soldat är inne. Det tonas tillbaka när huset töms.
- Fiender inne i hus döljs av taket (de syns ändå bara om sikten tillåter).

**Sortering.** Allt ses rakt ovanifrån, så sorteringen följer lagren i tabellen ovan. Det finns ingen djupsortering efter y-koordinat.

**Förstörda varianter.** [EJ BESLUTAT → standardval: stöds inte i första versionen] Byggnader kan inte skadas i dag.

---

## E. Soldater och animation

**Nuläge** [STÖDS]

- Soldaterna ritas med kod på canvas (`dist/src/soldiers.js`), inte med bilder.
- Varje soldat ritas med **fri rotation** runt sitt origo, vänd österut (+x), i storleken 1,12 × de lokala enheterna nedan.
- Referensbilder: `reference/soldiers-1x.png` (spelets verkliga storlek) och `reference/soldiers-4x.jpg` (förstorad), på fyra olika underlag för båda sidor.

**Soldatens lokala koordinatsystem (KRAV för leveranser)**

- Origo (0,0) = mitten av torson/axlarna. Det är den punkt spelet placerar och roterar kring.
- Soldaten är vänd åt +x (höger). Vänster hand/sida är −y.
- 1 lokal enhet = 1 spelenhet ÷ 1,12. Rita i lokala enheter; spelet skalar.
- Referensruta: x från −18 till +30, y från −12 till +12 (48 × 24 lokala enheter). Hela soldaten, inklusive gevär, mynningsflamma och skugga, ska rymmas i rutan.
- I nuvarande ritning:
  - Hjälmen är centrerad kring (3, −1) med radie ≈ 4,5.
  - Axlarna är ≈ ±5 i y.
  - Ryggsäcken sitter kring (−4, 0).
  - Geväret går från x = 4 (kolv) till x = 19 (mynning), på y = 2,2.
  - Stående fötter når x ≈ −12. Liggande ben når x ≈ −17.

**Tillstånd som behövs**

| Tillstånd | I dag [STÖDS] | Skiljs åt genom |
|---|---|---|
| Står / redo | ja | Kompakt form, ben under kroppen |
| Går | ja, benpendling efter tillryggalagd sträcka | Ben växelvis framåt och bakåt ±1,9 enheter |
| Ligger (försvar, nedtryckt, låg moral) | ja | Utsträckta ben bakåt till −17, bredare skugga |
| Kryper | ja (liggande plus benrörelse) | Som liggande, med ben som växlar |
| Skjuter | ja: rekyl −1,2 i x plus mynningsflamma i 0,12 s | Flamma vid mynningen, kort bakåtryck |
| Utslagen | ja | Halvgenomskinlig, hopsjunken, geväret bredvid |
| Gruppchef | ja: liten sandfärgad chevron på hjälmen | Detalj på hjälmen |
| Kulspruteskytt | nej, [PLANERAT] fas C | Annat vapen, eventuellt medhjälpare |

**Uppspelning.** Animationerna drivs av spelets tillstånd, inte av en klocka: gångcykeln följer tillryggalagd sträcka. Allt stannar alltså automatiskt vid paus.

[EJ BESLUTAT → standardval] **Kodritade soldater behålls.**

- Leveransen är en lagerindelad SVG i det lokala koordinatsystemet ovan.
- Claude översätter den till canvaskod: ben, torso, utrustning, huvud och vapen som separata lager, och benen animeras i koden.
- Skäl: fri rotation, skarpa vid alla zoomnivåer, liten filstorlek, enkel variation mellan sidor och roller.
- Spritesheets införs bara om ett konkret behov uppstår. Då gäller: 8 bildrutor per gångcykel, 12 bildrutor/s vid normal gånghastighet, samma origo i varje ruta.

**Sidornas särskiljning.** Färg och form ska båda bära skillnaden: hjälmform, utrustningens placering och en tydligt annorlunda gråton. Nuvarande paletter:

| | rock | ljus | mörk | hjälm | kant | remmar | ryggsäck |
|---|---|---|---|---|---|---|---|
| Egen (0) | `#8a8b54` | `#b9b887` | `#555b35` | `#6d7943` | `#bbc18b` | `#b2a479` | `#797552` |
| Fiende (1) | `#788079` | `#a7aea0` | `#484f4c` | `#626d64` | `#a7b1a0` | `#5b5544` | `#5b665d` |

**Kända svagheter** (se `reference/soldiers-4x.jpg`)

- Egna soldater smälter in mot gräs och tät vegetation. Den mörka konturen bär nästan hela kontrasten.
- Fiendens gråa uniform är svår att se mot grusvägen.
- Mynningsflamman har formen av en pil som ser ut att peka bakåt mot soldaten.
- Stående och liggande skiljer sig mest genom benen. Torson ser likadan ut.

---

## F. Gränssnitt

**Teknik** [STÖDS]

- Gränssnittet är vanlig HTML och CSS (`dist/index.html`, `dist/style.css`) bredvid kartan.
- Text och knappar är riktiga element och får aldrig bakas in i bilder.
- Design levereras som CSS-värden eller en statisk HTML/CSS-skiss, med PNG som komplement.

**Nuvarande designvariabler** (`:root` i `style.css`)

| Variabel | Värde | Används till |
|---|---|---|
| `--bg` | `#151a17` | Sidans bakgrund |
| `--panel` | `#202720` | Paneler |
| `--line` | `#394135` | Linjer och ramar |
| `--text` | `#e7e9da` | Text |
| `--muted` | `#a4ae9b` | Sekundär text |
| `--accent` | `#d7c28e` | Sandfärgad accent, vald grupp |
| `--green` | `#a4bd83` | Moral: stabil |
| (hårdkodad) | `#d89b70` | Moral: pressad/bruten |

Typsnitt: `system-ui`. [EJ BESLUTAT] Ett eget typsnitt får föreslås. Det kräver fri licens och WOFF2-fil, och Björn godkänner.

**Komponenter**

| Komponent | Status | Innehåll |
|---|---|---|
| Gruppkort (`.squad`) | [STÖDS] | Nummer, namn, levande/5, aktuell order, moraltext (Stabil/Pressad/Bruten), moralstapel |
| Orderknappar | [STÖDS] | Förflytta, Försvara. [PLANERAT] Anfall |
| Soldatnärbild och detaljer | [STÖDS] | Ställning, terrängskydd, ammunition i %, order |
| Uppdragsruta | [STÖDS] | Mål, kontrollstapel 0–20 s |
| Klocka, fas och paus | [STÖDS] | 06:00 nedräkning, PLANERING/STRID PÅGÅR/PAUSAD/AVSLUTAD. [PLANERAT] Spelhastighet |
| Händelselogg | [STÖDS] | De senaste 5 händelserna med tid |
| Resultatskärm | [STÖDS] | Rubrik, text, Spela igen |
| Toast-meddelande | [STÖDS] | Kort återkoppling när en order inte går att utföra |

**Tillstånd som ska designas för interaktiva komponenter**

- normal
- hover
- vald
- tangentbordsfokus (synlig fokusring, **KRAV**)
- inaktiverad
- varning

Varning får inte bäras av färgen enbart (**KRAV**). Använd också form, ikon eller text.

**Skärmstorlekar** [STÖDS]

- Layouten är gjord för 1366 × 768 till 1920 × 1080 och större.
- Brytpunkter finns vid 1000 och 760 px.
- Mobil är inte ett mål i första versionen.

---

## Arbetsflöde och leveranser

**Arbetsgång**

1. Claude skriver en beställning (`REQUEST_nnn.md`).
2. Björn skickar den till GPT.
3. GPT levererar ett paket.
4. Björn lämnar paketet till Claude.
5. Claude kontrollerar paketet mot specifikationen och integrerar det.
6. Claude tar skärmbilder från spelet.
7. Björn provspelar.
8. GPT får konkret återkoppling.

**Leveransformat (KRAV)**

GPT levererar en mapp eller zip-fil som heter `REQUEST_nnn-v<version>` och innehåller:

- De färdiga filerna, namngivna enligt C.
- `overview.png`: en översiktsbild av paketet.
- `INTEGRATION.md`: en kort beskrivning med mått, referenspunkter, lagerordning, animationsordning, kända begränsningar samt ursprung och licens för externa delar.
- `manifest.json`, enligt exemplet nedan.

```json
{
  "package": "REQUEST_001",
  "version": 1,
  "assets": [
    {
      "id": "house0-roof",
      "file": "bldg-house0-roof-v1.png",
      "kind": "raster",
      "pixelSize": [524, 460],
      "pxPerUnit": 4,
      "anchor": { "pixel": [0, 0], "world": [436, 112] },
      "worldSize": [131, 115],
      "layer": "roof",
      "states": null,
      "concept": false
    },
    {
      "id": "soldier-rifleman",
      "file": "soldier-rifleman-v1.svg",
      "kind": "svg",
      "viewBox": [-18, -12, 48, 24],
      "origin": [0, 0],
      "layer": "units",
      "states": ["ready", "walk", "prone", "crawl", "fire", "fallen"],
      "concept": false
    }
  ]
}
```

**Hantering hos Claude**

- Inkommande paket läggs i `art/incoming/REQUEST_nnn-vN/`, utanför det som publiceras, tills de är kontrollerade.
- Godkända filer flyttas till `dist/assets/…` och förs in i `docs/art/INTEGRATED.md`.
- Fungerande grafik ersätts inte förrän den nya versionen fungerar i spelet.

**Kvalitetskontroll i spelvyn** (inte bara i en bildvisare)

- Läsbarhet vid normal zoom.
- Kontrast mot gräs, väg, åker och vegetation.
- Rätt skala mellan objekt.
- Samma perspektiv och ljus som kartan.
- Rena alfakanter.
- Stabilt origo.
- Rätt lager.
- Markeringar som stämmer med spelreglerna.
- Animationer som stannar vid paus.
- Ingen märkbar prestandaförlust.

Grafik som gör spelet svårare att läsa godkänns inte, hur fin den än är.

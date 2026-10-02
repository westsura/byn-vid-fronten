# Speltest: infantry-rifleman-pilot-v2

Datum: 2026-09-30 · Granskat av: Claude · Status: **GRAFIKPROV V2 – EJ GODKÄNT.** Björn har inte provspelat.

## Så provas det

Välj *GRAFIKPROV V2 gevärsskytt* i grafikväljaren, eller öppna någon av dessa adresser:

- `?art=pilot-v2&side=soviet` – du leder sovjetisk grupp.
- `?art=pilot-v2&side=german` – du leder tysk grupp.

Kartan märks **GRAFIKPROV V2 – EJ GODKÄNT**. Standardgrafiken och prototypen v1 finns kvar oförändrade.

## Integration

- De fyra PNG-originalen och manifestet är kopierade **oförändrade** till `dist/assets/prototype/rifleman-pilot-v2/`. Ingen alfarensning är gjord.
- Bilderna registreras enligt TILL-CLAUDE:
  1. Flytta till soldatens position.
  2. Rotera med `heading − sourceForwardRadians`.
  3. Skala med `1 / pixelsPerUnit`.
  4. Rita hela bilden vid `−pivot`.
- Hela originalbilden ritas. `contentBoundsAlpha32` används inte till något.
- Omfattningen är begränsad enligt leveransen:
  - V2 används bara för tysk *Schütze* med K98k (5 per grupp) och sovjetisk *Rifleman* med M1891/30 (6 per grupp).
  - Gruppchef, MG, assistent, ammunitionsbärare, ställföreträdare, SVT och Mosin-assistent visas fortfarande med v1-sprites.
  - Gruppstorlekarna 10 och 11 är oförändrade.
- Tillstånden kopplas så här:
  - redo → `ready`
  - går → `ready` (gång är fortfarande spärrad)
  - liggande, kryper och skjuter → `prone`
  - utslagen → v1 `fallen`, eftersom v2 saknar den ställningen
- **Mynningsflamma** ritas nu från manifestets `muzzle`, roterad med soldaten, när en v2-skytt skjuter.
- Motorns mjuka markskugga ritas under figuren.

## Svar på frågorna i TILL-CLAUDE

| Fråga | Resultat i spelet |
|---|---|
| Följer vapnet riktningen? | **Ja.** I alla åtta riktningar ligger geväret parallellt med spelets riktningslinje, för båda sidor, både redo och liggande. Loppet ligger cirka 1–1,5 enheter vid sidan av riktningslinjen i redo. Det är acceptabelt. (`3-atta-riktningar-4x.jpg`) |
| Ger bredden 28/32 rätt skala? | **Rimligt.** Redo är cirka 0,75 × dörrbredden (38 enheter), och Västra huset (115 enheter) är cirka 4 soldatlängder. Skillnaden mellan redo och liggande är nu måttlig (28 mot 32), vilket är en tydlig förbättring mot v1 (24 mot 40–53). Förslag: lås 28/32. (`4-skala-mot-hus-och-dorr-4x.jpg`) |
| Pivot och mynning | Pivoten ligger stabilt vid torson i alla riktningar och soldaten roterar inte runt fötterna. Flamman hamnar vid mynningen i alla åtta riktningar. |
| Byte redo ↔ liggande | Fungerar utan att positionen hoppar, men hjälmen flyttas cirka 3 enheter framåt och mynningen cirka 5 enheter bakåt. Se nedan. (`5-byte-redo-liggande.gif`) |

## Grafikfel (att skicka till grafikproduktionen)

1. **Kroppen i redo pekar fortfarande fel.**
   - Fötterna går nedåt i bilden, det vill säga åt soldatens högra sida efter rotation. Axlarna ligger inte vinkelrätt mot vapnet.
   - Vid 0° ser det ut som att soldaten går söderut men siktar österut. Syns tydligast i spelets normalzoom när gruppen står stilla.
2. **Registreringen skiljer sig mellan redo och liggande.**
   - I redo sitter pivoten mitt på hjälmen. I liggande sitter den på ryggen, cirka 3 enheter bakom hjälmen.
   - Mynningen ligger cirka 19 enheter framför pivoten i redo men bara cirka 14 i liggande.
   - Vid byte hoppar därför hjälm och vapen. Pivoten bör sitta på samma kroppspunkt (axelmitten) i båda bilderna, och mynningens avstånd bör vara ungefär detsamma.
3. **Stilen skiljer sig från v1-rollerna i samma grupp.**
   - V2-skyttarna är smalare, har mindre packning och ljusare kanter än v1-figurerna bredvid.
   - I en blandad grupp syns två olika grafikstilar (`2-terrang-4x.jpg`, översta raden är v1). Det försvinner när specialistrollerna görs om i v2-stil.
4. **Sovjetisk khaki mot grusväg.**
   - Det är bättre än v1 tack vare den ljusare kanten, men fortfarande svagast av alla kombinationer (`2-terrang-4x.jpg` uppe till vänster).
   - Mot gräs och mörk vegetation fungerar båda sidor.
5. **Hjälmstorlek och kroppsskala skiljer sig mellan ställningarna**, som leverantören själv angav. Vid normalzoom är det knappt märkbart.
6. **Svaga alfarester** syns inte i spelet vid normalzoom eller 4×. Ingen åtgärd behövs för spelets skull, men de bör rensas före slutleverans.

## Integrationsfel och begränsningar (hos Claude)

1. V2 saknar `fallen`, så en utslagen v2-skytt byter till v1-figur. Stil och storlek hoppar då.
2. Gång och kryp är spärrade. Soldaterna glider i redo- och liggande-ställning.
3. Inne i hus ritas soldaterna fortfarande stående och vända utåt, medan reglerna räknar dem som liggande. Samma som i v1.
4. Formationens avstånd (20 × 23 enheter) gör att geväret på redo-figurer (28 enheter) når fram till grannen. Formationen kan behöva luckras upp för v2-skalan. Det är inte ändrat.
5. Moralbalansen för grupper om 10–11, rollernas effekt i strid och scenariotexten är oförändrade sedan v1-granskningen.

## Filer

| Fil | Innehåll |
|---|---|
| `1-normalzoom-vag-gras-vegetation.jpg` | Hela spelet i normalzoom. Egna och fiendegrupper på väg, gräs och mörk vegetation, stående och liggande |
| `2-terrang-4x.jpg` | Spelets egna pixlar förstorade 4×: sovjetisk på väg och i mörk vegetation, tysk på väg och i buskage |
| `3-atta-riktningar-4x.jpg` | Båda sidor: redo, liggande och eld med flamma i 8 riktningar, med pivot (gult kors) och riktningslinje (röd). v1 visas som jämförelse |
| `4-skala-mot-hus-och-dorr-4x.jpg` | Gevärsskyttar redo och liggande bredvid Västra husets dörr (38 enheter bred) |
| `5-byte-redo-liggande.gif` | Byte mellan redo och liggande med markerad pivot, båda sidor |
| `6-strid-tysk-normalzoom.jpg`, `6-strid-vagkorsning-2x.jpg` | Tysk sida i en pågående strid |

> **2026-10-02:** GIF-inspelningarna som nämns här är borttagna ur repot för att hålla nere storleken. De skickades till Björn i chatten. Nya GIF-filer läggs inte i repot.

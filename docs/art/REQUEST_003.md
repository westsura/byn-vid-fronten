# REQUEST_003 – Gångcykel, pilot: tysk gevärsskytt

Paket: `REQUEST_003` · version 1 · 2026-10-01
Beställare: Björn · Teknisk specifikation: Claude · Utförare: GPT

## Syfte

Detta är spelets första riktiga animation. Det är en pilot med **en roll och en rörelse**: den tyska gevärsskytten (Schütze med K98k) som går. Piloten ska visa att en gångcykel i v4-stil fungerar i spelet innan cykeln görs för alla roller och för krypning.

Utgångsfiguren är den godkända tyska gevärsskytten med hjälmkorrigering 2, `reference/german-rifleman-helmet-v2.png`. Björn provspelade och godkände stilen 2026-10-01.

Paketet är oberoende av `REQUEST_002` och kan levereras före eller efter det.

## Så används animationen i spelet

- Animationen drivs av **tillryggalagd sträcka**, inte av en klocka. Spelet räknar ut bildruta som `(sträcka / cykellängd) × 8`. Animationen stannar alltså när soldaten stannar och vid paus.
- Soldaterna går med 24–36 spelenheter per sekund. Med en cykellängd på cirka 24 enheter blir det 8–12 bildrutor per sekund.
- När soldaten stannar byter spelet direkt till redo-bilden. När han lägger sig byter spelet till liggande. Inga övergångsbilder ingår i piloten.
- Figuren roteras fritt efter riktningen, precis som i dag.

## Tekniska krav (KRAV)

- **Bildrutor:** 8 per cykel, numrerade 0–7. En cykel är två steg: vänster fot och höger fot.
  - Ruta 0 och 4 är kontaktlägen, med vänster respektive höger fot längst fram.
  - Ruta 2 och 6 är passerlägen, med benen under kroppen. Passerlägena ska ligga nära redo-bilden, så att stopp mitt i ett steg inte ser ut som ett hopp.
- **Skala och riktning:** samma som v4. 28 källpixlar per spelenhet. Figuren är vänd åt höger (+x), vinkel 0 pekar höger och positiv vinkel roterar medurs.
- **Fast axelpunkt:** `pivot` (axlarnas mitt) ska ligga på samma ställe i alla åtta rutor.
  - Kroppen får vridas lätt i axlarna, högst cirka ±5°, som motrörelse till benen.
  - Hjälmcentrum får röra sig högst 0,5 enheter mellan rutorna.
- **Vapnet:** hålls framåt i samma läge som i redo-bilden.
  - Mynningen får avvika högst 1 enhet framåt eller bakåt och högst 0,5 i sidled från redo-bildens mynning, i alla rutor.
  - Då kan soldaten skjuta och stanna utan att geväret hoppar.
- **Fötterna får inte glida.** En fot som står i marken ska flytta sig bakåt i bilden med exakt den sträcka soldaten rör sig.
  - Ange för varje ruta den stödjande fotens position, i pixlar relativt utsnittet (`plantedFoot`).
  - Ange cykelns längd i spelenheter (`cycleDistanceUnits`). Spelet använder värdet för att stega rutorna. Riktvärde: 20–28 enheter.
- **Läsbarhet:** benrörelsen ska synas vid normal zoom, där soldaten är cirka 22 skärmpixlar lång. I kontaktlägena ska fötterna tydligt sticka ut framför och bakom kroppens kontur.
- **Utseende:** samma uniform, hjälm, utrustning, ljus och linjetjocklek som `german-rifleman-helmet-v2`.
  - Ingen ny utrustning.
  - Genomskinlig bakgrund och ingen bakad skugga. Spelet ritar en liten kontaktskugga.
- **Utsnitt:** valfri arklayout. Varje ruta har eget `sourceRect`. Alla rutor ska ha samma storlek, gärna 1254 × 700 som redo-bilden.

**Manifest** (`manifest.json`), samma format som v4 med två tillägg:

```json
{
  "version": "german-rifleman-walk-pilot-v1",
  "base": "german-helmet-correction-v2",
  "frames": {
    "german-rifleman-walk-0": {
      "file": "german-rifleman-walk.png",
      "sourceRect": [0, 0, 1254, 700],
      "pivot": [600, 390],
      "muzzle": [1115, 400],
      "helmetCenter": [659, 385],
      "plantedFoot": [0, 0],
      "pixelsPerUnit": 28,
      "sourceForwardRadians": 0,
      "contentBoundsAlpha32": [0, 0, 0, 0],
      "status": "animation-pilot-not-approved",
      "registration": "…"
    }
  },
  "animations": {
    "german-rifleman-walk": {
      "frames": ["german-rifleman-walk-0", "…", "german-rifleman-walk-7"],
      "cycleDistanceUnits": 24,
      "loop": true,
      "drive": "distance"
    }
  }
}
```

Värdena i exemplet är platshållare, utom `pivot`, `muzzle` och `helmetCenter`. De är redo-bildens nuvarande värden och visar vilka värden rutorna ska hålla sig nära.

## Bifogat underlag

| Fil | Innehåll |
|---|---|
| `REQUEST_003.md` | Den här beställningen |
| `ART_BRIEF.md` | Gemensamt underlag. Avsnitt E är delvis inaktuellt; denna beställning gäller före |
| `reference/german-rifleman-helmet-v2.png`, `reference/manifest-german-helmet-v2.json` | Utgångsfiguren (redo och liggande) med registreringspunkter |
| `reference/manifest-example-german-support-v1.json` | Manifestformatet |
| `reference/tysk-grupp-4x-i-spelet.jpg` | Hela tyska gruppen i spelet, 4× |
| `reference/normalzoom-i-spelet.jpg` | Spelet i normal zoom, för att bedöma vad som syns |

## Leverans

Mappen eller zip-filen `REQUEST_003-v1/` ska innehålla:

| Fil | Krav/förslag | Innehåll |
|---|---|---|
| `german-rifleman-walk.png` | **KRAV** | De åtta rutorna |
| `manifest.json` | **KRAV** | Enligt ovan |
| `measurements.json` | **KRAV** | Per ruta: axelpunktens, hjälmens och mynningens avvikelse från redo-bilden i spelenheter, samt den stödjande fotens förflyttning mellan rutorna |
| `preview.html` | **KRAV** | Cykeln i loop: på stället, och med figuren förflyttad över en enkel markyta med rätt hastighet (cirka 30 enheter/s), så att fotglidning syns. Både 1× och 4×, i två riktningar (0° och 45°) |
| `walk-strip-4x.png` | **KRAV** | De åtta rutorna i en rad, 4×, med axelpunkt, hjälm, mynning och stödjande fot markerade |
| `TILL-CLAUDE.md`, `VALIDATION.md`, `PROMPTS.md` | **KRAV** | Som i tidigare paket |
| `german-rifleman-walk.gif` | FÖRSLAG | Kort loop för Björn |

## Utanför piloten

Om piloten godkänns blir nästa steg:

- gångcykel för alla tyska och sovjetiska roller med samma rutstruktur;
- krypcykel (förslagsvis 6 rutor);
- eventuellt korta övergångar mellan stående och liggande.

Inget av detta ska göras nu.

## Överlämning och godkännande

1. **GPT** levererar paketet och stannar där.
2. **Claude** gör följande:
   - inför sträckstyrd uppspelning i spelet, bara för den tyska gevärsskytten, i ett nytt valbart grafikprov;
   - behåller tidigare lägen som reserv;
   - kontrollerar punkterna nedan;
   - lämnar skärmbilder och korta inspelningar i normal zoom och 4×, där en hel tiomannagrupp går. Grafikfel och integrationsfel redovisas var för sig.
3. **Björn** provspelar och godkänner eller begär ändringar.

**Piloten godkänns när:**

1. Åtta rutor finns, med samma axelpunkt, och skalan är 28 px per enhet.
2. Fötterna glider inte synbart vid 4× när spelet stegar med `cycleDistanceUnits`.
3. Gevärets mynning håller sig inom gränserna ovan i alla rutor. Mynningsflamman och bytet till redo och liggande ser stabila ut.
4. Rörelsen syns vid normal zoom, och gruppen ser ut att gå, inte glida.
5. Ingen märkbar prestandaförlust med 21 soldater i rörelse.
6. Björn godkänner efter provspelning.

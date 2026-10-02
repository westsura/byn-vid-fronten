# REQUEST_004 – Gångcykel v2 (tysk gevärsskytt)

Paket: `REQUEST_004` · version 1 · 2026-10-02
Beställare: Björn · Teknisk specifikation: Claude · Utförare: GPT

## Bakgrund

Gångpiloten i `REQUEST_003` v1 är integrerad och speltestad. Granskningen finns i `reference/REVIEW-REQUEST_003.md`. Resultatet:

- **Det som fungerar ska behållas:**
  - Sträckstyrd uppspelning med 8 rutor.
  - Fast axelpunkt.
  - Gevär och mynning står still.
  - Ingen mätbar prestandaförlust.
- **Rörelsen syns knappt i spelets storlek.** Benen ligger dolda under överkroppen, och bara stövlarna sticker ut 3–4 enheter. Vid normal zoom är det 2–3 skärmpixlar.
- **Foten glider.** Inom varje ruta följer stödfoten med kroppen cirka 3 enheter och hoppar sedan tillbaka. Det är samma begränsning som TILL-CLAUDE i v1 varnade för.

**Björns beslut 2026-10-02**

- Stegen ska vara längre.
- Det ska finnas en lätt vridning i axlar och höfter.
- Uniformens färg ändras inte.

Paketet omfattar gångcykel v2 för tysk gevärsskytt, levererad i **lager**. Den rättade tyska utslagna figuren är redan levererad (`REQUEST_002-german-fallen-v2`) och ingår inte här.

## Gångcykel v2, i lager

### Varför lager

Om vänster ben, höger ben och överkropp levereras som separata bilder kan spelet hålla stödfoten **helt still på marken**, även mellan rutbytena. Spelet ritar stödbenet förskjutet bakåt exakt lika mycket som kroppen har rört sig sedan rutan började. Det svängande benet följer kroppen.

Fotglidningen löses därmed i motorn med samma 8 rutor. Leverantören ska **inte** baka in någon sådan förskjutning i bilderna.

Leverantören bygger redan bilden av överkropp och ben (`source/legs.png`, `build-atlas.cjs` i v1). Skillnaden är att lagren levereras var för sig i stället för sammanslagna.

### Lager per ruta (KRAV)

| Lager | Innehåll | Ritordning |
|---|---|---|
| `leg-left` | Vänster ben med stövel, från höften | underst |
| `leg-right` | Höger ben med stövel, från höften | underst |
| `upper` | Allt annat: höft och bål, armar, packning, hjälm och gevär | överst |

- Samma ruta, utsnittsstorlek, `pivot` och 28 källpixlar per enhet i alla tre lagren. Lagren ska ligga exakt rätt mot varandra när de ritas på samma punkt.
- Ritade ovanpå varandra utan förskjutning ska de ge den färdiga rutan. Leverera också den sammanslagna atlasen (`german-rifleman-walk-v2.png`). Den används som reserv och för jämförelse.

### Rörelsen (KRAV)

- **8 rutor per cykel**, numrerade som i v1:
  - 0 och 4 är kontaktlägen, med vänster respektive höger fot fram.
  - 2 och 6 är passerlägen.
- **Längre steg.** I kontaktlägena ska framfotens tå ligga minst 4 enheter framför överkroppens kontur, vid sidan av gevärsarmen. Bakfotens häl ska ligga minst 4 enheter bakom packningens bakkant.
  - Det ger cirka 4 skärmpixlar vid normal zoom, mot 1–2 i v1.
  - Det är tillåtet att överdriva något jämfört med verkligheten. Läsbarheten i spelets storlek går före.
- **Cykellängd:** ange den verkliga cykellängden i `cycleDistanceUnits`. Riktvärde 32–40 enheter. Varje ruta motsvarar en åttondel.
- **Höftvridning:** cirka ±8° i benlagrets höftparti, i takt med stegen.
- **Axelvridning:** cirka ±3–4° i `upper`, i motsatt riktning mot höfterna.
  - Geväret får följa med lite, men mynningen får avvika högst **1 enhet i sidled** och **1 enhet i längsled** från redo-bildens mynning.
  - Hjälmcentrum får röra sig högst 0,5 enheter.
  - Ange `muzzle` och `helmetCenter` per ruta.
- **Passerlägena** (2 och 6) ska ligga nära redo-bilden, så att stopp mitt i ett steg inte ser ut som ett hopp.
- **Utseende:** samma uniform, färg, hjälm (hjälmkorrigering 2), utrustning, ljus och linjetjocklek som den godkända gevärsskytten. Ingen ny utrustning.

### Manifest (KRAV)

Samma format som v1, med tillägg per ruta:

```json
"german-rifleman-walk-0": {
  "layers": {
    "leg-left":  { "file": "german-rifleman-walk-v2-layers.png", "sourceRect": [0, 0, 1254, 700] },
    "leg-right": { "file": "german-rifleman-walk-v2-layers.png", "sourceRect": [0, 700, 1254, 700] },
    "upper":     { "file": "german-rifleman-walk-v2-layers.png", "sourceRect": [0, 1400, 1254, 700] }
  },
  "file": "german-rifleman-walk-v2.png",
  "sourceRect": [0, 0, 1254, 700],
  "pivot": [600, 390],
  "muzzle": [1115, 400],
  "helmetCenter": [659, 385],
  "plantedLeg": "left",
  "plantedFoot": [0, 0],
  "pixelsPerUnit": 28,
  "sourceForwardRadians": 0
}
```

- `plantedLeg` anger vilket ben som står i marken i rutan. Spelet förskjuter just det benet.
- I `animations` anges `cycleDistanceUnits`, `loop: true` och `drive: "distance"` som i v1.
- Värdena i exemplet är platshållare, utom `pivot`, som ska vara redo-bildens.

### Leverans

| Fil | Krav/förslag | Innehåll |
|---|---|---|
| `german-rifleman-walk-v2-layers.png` | **KRAV** | Lagren, valfri arklayout enligt manifestet |
| `german-rifleman-walk-v2.png` | **KRAV** | Sammanslagna rutor, som i v1 |
| `manifest.json`, `measurements.json` | **KRAV** | Mätfilen anger per ruta: framfotens och bakfotens avstånd utanför konturen, höft- och axelvinkel, samt mynningens och hjälmens avvikelse från redo |
| `walk-strip-4x.png` | **KRAV** | De 8 rutorna i 4×, med markeringar, plus en rad med enbart benlagren |
| `preview.html` | **KRAV** | Cykeln i rörelse, 1× och 4×. Om möjligt med samma lagerförskjutning som spelet, se ovan |
| `TILL-CLAUDE.md`, `VALIDATION.md`, `PROMPTS.md` | **KRAV** | Som tidigare |

## Bifogat underlag

| Fil | Innehåll |
|---|---|
| `REQUEST_004.md` | Den här beställningen |
| `reference/REVIEW-REQUEST_003.md` | Claudes granskning av gångpiloten v1 |
| `reference/request-003-v1/` | V1:s manifest, atlas och källfiler (`legs.png`, `build-atlas.cjs`) |
| `reference/gang-v1-4x-gras.gif`, `reference/grupp-gar-v1-4x.gif` | V1 i spelet, 4× |
| `reference/stodfot-varldsposition-v1.json` | Uppmätt glidning i v1: stödfotens markposition per spelsteg |
| `reference/german-rifleman-helmet-v2.png`, `reference/manifest-german-helmet-v2.json` | Godkänd gevärsskytt, utgångsfigur |

## Överlämning och godkännande

1. **GPT** levererar paketet `REQUEST_004-v1/` och stannar där.
2. **Claude** gör följande:
   - inför lagerritning med förskjutning av stödbenet i ett nytt valbart grafikprov;
   - behåller v1 som reserv;
   - mäter fotglidningen på samma sätt som för v1;
   - lämnar GIF-filer i 4× och normalzoom samt en granskning. Grafikfel och integrationsfel redovisas var för sig.
3. **Björn** provspelar och godkänner eller begär ändringar.

**Godkänns när:**

1. Lagren ger den sammanslagna rutan när de ritas utan förskjutning.
2. Med spelets lagerförskjutning glider stödfoten mindre än 0,5 enheter på marken.
3. Stegen syns vid normal zoom i en hel grupp.
4. Mynning och hjälm håller sig inom gränserna. Bytet mellan gång, redo och skott ser stabilt ut.
5. Björn godkänner efter provspelning.

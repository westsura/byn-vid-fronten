# REQUEST_005 – Östfrontsby: kartdelar (mark, byggnader, vegetation, hinder)

Paket: `REQUEST_005` · version 1 · 2026-10-05
Beställare: Björn · Teknisk specifikation: Claude · Utförare: GPT

> Det här dokumentet är prompten till GPT. Klistra in allt från "Uppdrag" och nedåt. `ART_BRIEF.md` gäller där inget annat sägs här. Där briefen beskriver Normandie 1944 gäller i stället östfronten 1943 enligt nedan.

---

## Uppdrag

Du gör grafik till "Byn vid fronten", ett taktiskt infanterispel i webbläsaren som ses **rakt ovanifrån** (ortografiskt, 90°, ingen snedvy). Spelet flyttar från en fransk by till **en sovjetisk by på östfronten, sensommaren 1943** (operation *Unternehmen Morgenlicht*, byn *Berezovka*). En tysk pluton angriper från väster och ska ta tillbaka en stenbyggnad som sovjetiska trupper håller.

Kartan ska inte längre vara en enda målad bild. Den byggs av **delar** som spelet placerar ut från en datafil:

1. **Sömlösa marktexturer** som upprepas och blandas.
2. **Fristående objekt** (hus, träd, brunnar, höstackar) som egna bilder med genomskinlig bakgrund.
3. **Linjära delar** (staket, häckar, ravinkanter, vägar) som segment som kan läggas efter varandra.

Samma datafil ger spelreglerna: väggar, skydd, sikt och hastighet. Därför ska varje byggnad och hinder levereras med sin **geometri i spelenheter**, så att bild och regler aldrig glider isär.

Leveransen sker i **två omgångar**:

- **Omgång 1, stilprov:** ett litet urval (se avsnitt 8) som provas i spelet innan resten görs.
- **Omgång 2, hela paketet:** görs först när Björn har godkänt stilprovet.

Gör bara omgång 1 nu.

## 1. Miljö och stil

**Plats och tid:** en by i Ukraina/södra Ryssland, augusti 1943, efter strider i närheten men före total förstörelse.

- Torr, varm sensommar med gulnande gräs, mogen eller skördad säd, dammiga vägar och lite lera i svackor.
- Vinter och snö kommer i ett senare paket.

**Byggnader**

- *Izbor*: timmer- eller lerklinade hus som ofta är vitkalkade, med halm- eller plank- och spåntak.
- Uthus (*saraj*), en kolchosladugård och en brunn med vippstång (*zjuravl*).
- **En stenbyggnad** är scenariots mål: kolchosens kontor eller före detta skola i två våningar, i tegel eller kalksten med plåt- eller tegeltak.

**Terräng**

- Flack terräng med en **ravin** (*balka*) som skär genom kartan.
- Flätstaket (*pleten*) och plankstaket runt tomterna, köksträdgårdar, solrosor, fruktträd, björkar och pil vid vattnet.

**Stil**

- Behåll den målade, naturalistiska stilen och de dämpade jordtonerna från prototypen. Inga mättade färger.
- Terrängen får vara detaljerad, men soldaterna (som redan finns) måste synas tydligt ovanpå. Det gäller särskilt mot gult gräs, plöjd åker och säd.
- Inget får likna grafik ur *Close Combat* eller andra spel.

**Ljus (KRAV, samma i alla bilder)**

- Ljuset kommer från **nordväst** (uppe till vänster i bilden), och skuggorna faller mot sydost.
- Skuggans längd är ungefär **40 % av objektets höjd**. Ett 6 m högt träd kastar alltså en skugga på cirka 2,4 m (24 enheter).
- Skuggan bakas in i objektets bild, inom marginalen.

## 2. Skala, kartstorlek och upplösning

**Spelvärlden**

| Egenskap | Värde |
|---|---|
| Skala | 1 spelenhet = 0,1 m |
| Ny kartstorlek (scenario 1) | **3600 × 2400 enheter** (360 × 240 m) |
| Koordinater | Origo uppe till vänster; x österut (höger), y söderut (nedåt) |
| Soldat | Cirka 22 × 16 enheter. Avsiktligt cirka 2× verklig storlek, så byggnader och träd ritas i verklig skala och ändå är soldaterna tydliga. |

**Varför två olika upplösningar**

- Spelet har tre zoomnivåer: hela kartan, pluton och grupp.
- På gruppnivå visas cirka 3 skärmpixlar per spelenhet, och på en retinaskärm dubbelt så många.
- Objekt med skarpa kanter (tak, väggar, staket, träd) behöver därför hög upplösning.
- Marken är mjuk och upprepas över stora ytor. Där räcker lägre upplösning, och det håller nere laddtiden.

| Typ | Upplösning (KRAV) | Format |
|---|---|---|
| Marktexturer | **4 px/enhet** | WebP utan alfa, kvalitet cirka 85 (PNG som källa går också) |
| Objekt, byggnader och linjära delar | **6 px/enhet** | PNG-32 med rak alfa (inga färgfransar) |
| Dekaler (kratrar, hjulspår, fläckar) | **4 px/enhet** | PNG-32 med mjuk alfakant |
| Konceptbild av hela byn | 0,5 px/enhet (1800 × 1200 px) | JPEG eller PNG, märkt `concept-` |

**Räkneexempel:** en izba på 7 × 9 m är 70 × 90 enheter. Med 6 px/enhet blir det 420 × 540 px, plus marginal för skugga.

**Storleken i spelet är alltid låst** till de spelenheter som anges i tabellerna nedan. Upplösningen påverkar bara skärpan.

## 3. Marktexturer (sömlösa)

Varje textur ska vara sömlös i båda riktningarna och sakna tydliga enskilda detaljer som avslöjar upprepningen, till exempel en ensam sten eller blomma som syns om och om igen. Variationen ska vara jämnt fördelad.

| Id | Innehåll | Bild (px) | Täcker (enheter) |
|---|---|---|---|
| `ground-grass-dry` | Torrt, gulnande ängsgräs, kortklippt av bete | 2048 × 2048 | 512 × 512 |
| `ground-grass-tall` | Högt stäppgräs och ogräs, lite mörkare | 2048 × 2048 | 512 × 512 |
| `ground-field-ploughed` | Plöjd åker, fårorna **vågrätt** (längs x) | 2048 × 2048 | 512 × 512 |
| `ground-field-stubble` | Skördad stubbåker, raderna **vågrätt** | 2048 × 2048 | 512 × 512 |
| `ground-field-wheat` | Mogen, stående säd sedd uppifrån | 2048 × 2048 | 512 × 512 |
| `ground-yard` | Upptrampad gårdsplan: jord, damm, halmstrån, lite gräs | 2048 × 2048 | 512 × 512 |
| `ground-garden` | Köksträdgård: rader med potatis och kål, **vågräta** | 2048 × 2048 | 512 × 512 |
| `ground-mud` | Fuktig lera i svackor och ravinbotten | 2048 × 2048 | 512 × 512 |

**Vägar** levereras som remsor som upprepas **längs x**. Kanterna har mjuk alfa, så att vägen smälter in i marken under. Spelet böjer remsan längs vägens linje.

| Id | Innehåll | Bild (px) | Täcker (enheter) |
|---|---|---|---|
| `road-dirt-main` | Bygata av packad jord med två hjulspår, 6 m bred | 2048 × 320 (alfa) | 512 × 80 |
| `road-dirt-track` | Smal kärrväg eller stig, 3 m bred | 2048 × 160 (alfa) | 512 × 40 |

Övergångarna mellan marktyper gör spelet med brusmasker. Du behöver inte leverera övergångsbilder.

## 4. Byggnader

**Varje byggnad levereras som två bilder i exakt samma ruta:**

- `roof`: taket sett uppifrån, inklusive takfot och skugga. Spelet ritar taket över soldaterna och tonar ned det när egna soldater är inne.
- `interior`: golv, innerväggar, spis, bänkar och möbler sedda uppifrån, med **öppningar för dörrar och fönster** i ytterväggen. Visas när taket är nedtonat.

**Geometri (KRAV)** anges i manifestet, i spelenheter, relativt byggnadens övre vänstra hörn (exklusive skuggmarginalen):

- `footprint`: ytterväggarnas ytterkant som polygon.
- `walls`: ytterväggarnas tjocklek. Timmer cirka 3 enheter, sten cirka 5 enheter.
- `doors[]`: mittpunkt, vägg (n/s/ö/v) och bredd, normalt 9–12 enheter.
- `windows[]`: på samma sätt, normalt 6–10 enheter.
- `innerWalls[]`: linjer, om det finns rum.
- `material`: `timber`, `adobe` eller `stone`. Det styr skydd och nedslagseffekter.

| Id | Beskrivning | Storlek (enheter) | Ungefärlig bild (px) |
|---|---|---|---|
| `bldg-izba-a` | Vitkalkad izba, halmtak, 1 rum + farstu | 70 × 90 | 420 × 540 + marginal |
| `bldg-izba-b` | Timmerizba, plank- eller spåntak, 2 rum | 80 × 100 | 480 × 600 + marginal |
| `bldg-izba-c` | Liten lerklinad izba, halmtak delvis nedrasat | 60 × 80 | 360 × 480 + marginal |
| `bldg-saraj` | Uthus eller lada i plank, öppen gavel | 50 × 80 | 300 × 480 + marginal |
| `bldg-kolkhoz-barn` | Lång kolchosladugård, lerklinad, halmtak | 120 × 360 | 720 × 2160 + marginal |
| `bldg-stone-office` | **Målet:** kolchoskontor i tegel eller kalksten, 2 våningar, plåttak; flera rum, trappa, 4–6 fönster per långsida | 140 × 110 | 840 × 660 + marginal |

- Andra våningen hos stenbyggnaden visas inte separat i den här versionen. Interiören visar bottenvåningen.
- Stenbyggnaden ska gärna vara lätt skadad: några krossade fönster och en sotfläck. Den ska fortfarande se hel och försvarbar ut.

## 5. Fristående objekt

Alla objekt levereras i 6 px/enhet med skugga inom marginalen. **Trädkronor** ritas över soldaterna, så ge dem en lätt genomskinlig kant (alfa 0,85–1). Lämna också en separat liten bild för stammen (`-trunk`), som är det som blockerar rörelse.

| Id | Beskrivning | Storlek (enheter) | Varianter |
|---|---|---|---|
| `tree-birch` | Björk, krona | ⌀ 60–80 | 3 |
| `tree-willow` | Pil vid ravinen, bred krona | ⌀ 90–110 | 2 |
| `tree-apple` | Fruktträd i trädgård | ⌀ 45–55 | 3 |
| `tree-oak` | Ensam stor ek | ⌀ 120–140 | 1 |
| `bush` | Buske eller snår | ⌀ 20–35 | 4 |
| `sunflowers` | Bestånd av solrosor, rektangel som går att upprepa | 80 × 80 | 2 |
| `haystack` | Rund höstack | ⌀ 35–45 | 2 |
| `woodpile` | Vedtrave | 30 × 12 | 1 |
| `well-zhuravl` | Brunn med vippstång (stången kastar lång skugga) | 20 × 70 | 1 |
| `cart` | Trasig hästkärra | 25 × 40 | 1 |

**Geometri per objekt (KRAV)** i manifestet:

- `footprint`: det som blockerar rörelse, som cirkel eller polygon. För träd är det stammen, inte kronan.
- `canopy`: kronans eller beståndets yta, som cirkel eller polygon. Den skymmer sikt och ger lite skydd.

## 6. Linjära delar (segment)

Varje del är ett **rakt segment som går att lägga i följd längs x**. Lägg också till en **ändbit** och ett **hörn på 90°** där det behövs.

| Id | Beskrivning | Segment (enheter) | Delar |
|---|---|---|---|
| `fence-wattle` | Flätstaket (*pleten*), 1 m högt | 40 × 6 | rak, ände, hörn, trasig |
| `fence-plank` | Plankstaket | 40 × 5 | rak, ände, hörn, grind öppen |
| `hedge` | Låg häck eller buskrad | 40 × 18 | rak, ände, hörn |
| `ravine-edge` | Ravinens överkant: slänt som går ned mot ravinbotten (ravinen ligger **söder** om linjen i bilden) | 80 × 60 | rak, ytterhörn, innerhörn, ände som planar ut |
| `ravine-floor` | Ravinbotten med lera, sten och lite vatten (rak bit) | 80 × 80 | rak |

Ravinen byggs av två `ravine-edge`-rader mot varandra med `ravine-floor` emellan. Ravinen ska vara cirka 10–15 m bred och 3–4 m djup, och slänterna ska vara tydliga i skuggningen.

## 7. Dekaler (lägger sig på marken)

| Id | Beskrivning | Storlek (enheter) | Varianter |
|---|---|---|---|
| `crater-small` | Handgranat | ⌀ 10–14 | 3 |
| `crater-medium` | Granatkastare 8 cm | ⌀ 25–35 | 3 |
| `crater-large` | Artilleri | ⌀ 50–70 | 2 |
| `ruts` | Hjulspår i lera | 80 × 30 | 2 |
| `patch-dirt` | Jordfläck eller sliten yta | ⌀ 40–80 | 3 |
| `debris` | Bråte: brädor, tegel, halm | ⌀ 20–40 | 3 |

## 8. Omgång 1 – stilprov (gör bara detta nu)

1. `concept-berezovka-overview` (1800 × 1200 px). Det är en **konceptbild** av hela byn, inte en speltillgång. Innehåll:
   - En bygata från väst till öst ungefär mitt på kartan, med 12–16 izbor och tomter med staket.
   - Kolchosgården med stenbyggnaden och ladugården i östra halvan.
   - En ravin som slingrar sig från norr till söder öster om byn.
   - Åkrar och äng i väster, där tyskarna kommer in.
   - En björkdunge i norr.
2. Marktexturer: `ground-grass-dry`, `ground-field-ploughed`, `ground-yard` och `road-dirt-main`.
3. Byggnader: `bldg-izba-a` och `bldg-stone-office`, båda med `roof` och `interior` och full geometri.
4. Objekt: `tree-birch` (en variant med stam) och `haystack` (en variant).
5. Linjära delar: `fence-wattle` (rak, ände, hörn) och `ravine-edge` (rak).
6. `overview.png`: alla delar i omgång 1 utlagda på en yta av `ground-grass-dry`, i rätt inbördes skala, tillsammans med en tysk soldat (22 × 16 enheter) som skalreferens.

## 9. Leverans (KRAV, enligt ART_BRIEF avsnitt C och F)

- Leverera en mapp eller zip som heter `REQUEST_005-v1` och innehåller:
  - de färdiga filerna;
  - `overview.png`;
  - `INTEGRATION.md`;
  - `manifest.json`.
- Filnamn: gemener, bindestreck och ingen å/ä/ö: `<id>-<variant>-v1.<ext>`. Exempel: `bldg-izba-a-roof-v1.png`, `tree-birch-1-v1.png`, `ground-grass-dry-v1.webp`.
- Varje post i `manifest.json` innehåller:
  - `id`, `file`, `kind` (`texture`, `sprite`, `segment` eller `decal`);
  - `pixelSize`, `pxPerUnit` och `worldSize` (i enheter);
  - `anchor`: vilken pixel som motsvarar objektets origo. För byggnader är det footprintens övre vänstra hörn, och för träd och runda objekt mitten;
  - `layer`: `ground`, `decal`, `object`, `roof`, `interior` eller `canopy`;
  - geometrin enligt avsnitt 4–6;
  - `concept` (`true` eller `false`).
- Exempel på en byggnadspost:

```json
{
  "id": "bldg-izba-a-roof",
  "file": "bldg-izba-a-roof-v1.png",
  "kind": "sprite",
  "pixelSize": [468, 588],
  "pxPerUnit": 6,
  "worldSize": [78, 98],
  "anchor": { "pixel": [24, 24], "meaning": "footprint top-left" },
  "layer": "roof",
  "material": "adobe",
  "footprint": [[0, 0], [70, 0], [70, 90], [0, 90]],
  "walls": 3,
  "doors": [{ "wall": "s", "at": 35, "width": 10 }],
  "windows": [{ "wall": "w", "at": 30, "width": 8 }, { "wall": "e", "at": 30, "width": 8 }],
  "innerWalls": [[[0, 30], [70, 30]]],
  "concept": false
}
```

- **Storleksbudget för omgång 1:** högst 12 MB totalt. Varje marktextur högst 1,5 MB, och varje byggnad med tak och interiör högst 1,5 MB.
- **Kontroll innan du levererar:**
  - Lägg texturen 3 × 3 och kontrollera att inga skarvar eller upprepade detaljer syns.
  - Kontrollera att `pixelSize` = `worldSize` × `pxPerUnit`.
  - Kontrollera att skuggorna faller mot sydost i alla bilder.
  - Kontrollera att dörr- och fönsteröppningarna i `interior` stämmer med manifestets geometri.

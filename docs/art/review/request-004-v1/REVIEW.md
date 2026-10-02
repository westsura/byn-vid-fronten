# Speltest: REQUEST_004-v1 (gångcykel v2 i lager, tysk gevärsskytt)

Datum: 2026-10-02 · Granskat av: Claude · Status: **EJ GODKÄNT.** Björn har inte provspelat.

## Så provas det

Öppna `?art=pilot-w2&side=german` (eller `&side=soviet`). I grafikväljaren heter läget *GRAFIKPROV GÅNGCYKEL V2 i lager (REQUEST_004)*.

| Jämförelse | Adress |
|---|---|
| Samma bilder utan motorns fotlåsning | Lägg till `&footlock=off` |
| Gångcykel v1 | `?art=pilot-w1` |

Gångcykeln gäller bara tysk Schütze med K98k. Övrig grafik är som i `pilot-r2`, inklusive tyska utslagna v2.

## Integration

**Filer**

- Lageratlasen, reservatlasen och manifestet är kopierade **oförändrade** till `dist/assets/prototype/walk-v2-layers/`.
- Alla kontrollsummor i `SHA256SUMS.txt` stämmer.

**Ritning i motorn**

- Per ruta ritas `leg-left`, `leg-right` och `upper` i den ordningen, på samma axelpunkt.
- Stödbenet (`plantedLeg`) förskjuts bakåt lika mycket som soldaten har gått sedan rutan började: `within` = sträcka mod 5 enheter. Det är exakt leverantörens regel.
- Övriga lager förskjuts inte.

**Uppspelning**

Rutan väljs som tidigare efter gången sträcka. Cykellängden är 40 enheter enligt manifestet.

**Tester**

Alla 50 tester går igenom, varav 2 nya. De kontrollerar:

- att varje ruta har tre lager och samma axelpunkt, och att vänster ben är stödben i ruta 0–3 och höger i 4–7;
- att mynningen ligger inom 1 enhet från redo-läget;
- att stödfotens markposition, räknad med motorns regel, ändras mindre än 0,01 enheter under varje stödperiod.

## Kontroller enligt beställningen

**1. Lagren** – **uppfyllt**

Leverantören har kontrollerat att lagren lagda på varandra ger den sammanslagna bilden pixel för pixel. I spelet ser lagerritningen ut som den sammanslagna rutan när fotlåsningen är avslagen.

**2. Fotglidning** – **uppfyllt vid rak gång** (`3-stodfot-…json`, `2-gang-4x-rakt-…gif`)

Uppmätt i webbläsaren, med stödfotens markposition per spelsteg vid 30 enheter/s:

| | Stödfotens rörelse per stödperiod |
|---|---|
| Med fotlåsning | **0,0 enheter** i alla fyra hela stödperioder |
| Utan fotlåsning | 4,5 enheter. V1 hade cirka 3 |

Jämför `2-gang-4x-rakt-med-fotlasning.gif` och `…-utan-…`. Foten står stilla medan kroppen går förbi.

**3. Stegen syns** (`1-rutor-…-6x.jpg`, `4-grupp-gar-4x.gif`, `4-grupp-gar-normalzoom-2x.gif`) – **klar förbättring**

- I kontaktlägena sticker framfoten ut cirka 7 enheter framför kroppen och bakfoten cirka 4,6 enheter bakom packningen. I v1 var det 3–4 enheter.
- Vid 4× syns gången tydligt i en hel grupp.
- Vid normal zoom syns stövlarna växla som små prickar. Om det räcker får Björn avgöra vid provspelning.

**4. Vridning** – **uppfyllt**

- Höfterna vrids ±8° och axlarna ±3,2° i motsatt riktning.
- Vridningen syns vid 4×. Rörelsen är mindre stel än i v1.

**5. Mynning och hjälm** – **uppfyllt**

- Mynningen avviker högst 0,91 enheter i sidled. Mynningsflamman följer manifestets punkt per ruta.
- Hjälmcentrum står still.

## Integration och begränsningar (hos Claude)

1. **Svängar.** Fotlåsningen räknar i soldatens egen riktning. När soldaten svänger mitt i ett steg flyttar sig stödfoten med svängen, som leverantören påpekar. Det märks vid skarpa svängar vid 4×, men knappt i spelet, eftersom rutterna mest är raka sträckor. En exakt lösning kräver att motorn sparar fotens markposition. Jag gör det bara om det stör vid provspelning.
2. **Sidledsrörelse.** När soldaten trycks åt sidan av grannarna, eller går i en annan riktning än han tittar, räknas sträckan ändå som gång framåt. Foten kan då glida lite i sidled. Det gäller också v1.
3. **Andra roller** glider fortfarande i redo-ställning. Krypning saknas.

## Grafikfel

Inga nya. Uniform, hjälm och utrustning är oförändrade från den godkända gevärsskytten.

## Nästa steg, om Björn godkänner

Samma lagerupplägg för övriga roller, båda sidor, och därefter krypning.

## Filer

| Fil | Innehåll |
|---|---|
| `1-rutor-0-7-0-och-45-grader-6x.jpg` | Rutorna 0–7 som spelet ritar dem, 0° och 45°, 6× |
| `2-gang-4x-rakt-med-fotlasning.gif`, `…-utan-…` | En soldat som går över gräs, 4×, med och utan motorns fotlåsning |
| `2-gang-4x-snett-med-fotlasning.gif` | Samma sak i snett läge |
| `3-stodfot-med-fotlasning.json`, `…-utan-…` | Stödfotens markposition per spelsteg: steg, sträcka, ben, x, y |
| `4-grupp-gar-4x.gif` | Hel tiomannagrupp som går, 4× |
| `4-grupp-gar-normalzoom-2x.gif` | Gruppen i spelets normalzoom, förstorad 2× för visning |

> **2026-10-02:** GIF-inspelningarna som nämns här är borttagna ur repot för att hålla nere storleken. De skickades till Björn i chatten. Nya GIF-filer läggs inte i repot.

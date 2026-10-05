# Granskning – REQUEST_005 v1 (stilprov, östfrontsby)

Granskat av Claude 2026-10-05. **Status: ej godkänt** (stilprov; Björn bedömer stilen).

## Hur det provades

- Paketet kom som lösa bilder plus `manifest.json`, utan zip-fil, `overview.png` och `INTEGRATION.md`.
  - Claude kopplade bilderna till manifestets id efter bildens innehåll och storlek. Paketet ligger i `art/incoming/REQUEST_005-v1/`, utanför repot.
- Tekniska kontroller med skript:
  - storlek mot manifestet;
  - `pixelSize = worldSize × pxPerUnit`;
  - alfa och färgfransar;
  - skarvar när texturer läggs 3 × 3;
  - var staketets mittlinje ligger.
- Provet i spelet gjordes i en lokal kopia av spelet, inte i det publicerade.
  - En testby på 1200 × 800 enheter byggdes av delarna (`maptest.js`): mark, väg, ravin, staket, izbor, stenbyggnad, björkar och höstackar.
  - Kartan ritades i dubbel upplösning (som på en retinaskärm), med spelets riktiga soldater och alla tre zoomnivåer.
  - Ingen ny grafik är publicerad på Vercel.

**Förhandsvisning (publicerad 2026-10-05 på Björns begäran):** https://byn-vid-fronten.vercel.app/preview/testby-r5/

- Det är en separat kopia av spelet i `dist/preview/testby-r5/`. Det riktiga spelet är oförändrat.
- Husens väggar och skogens skydd följer testbyns tre hus och björkar.
- Dörrar och fönster följer ännu spelets gamla mall och inte bildernas exakta öppningar.
- Staket, ravin och åker är bara bild. De påverkar inte spelet.

Skärmbilder: `1-map.jpg`, `2-platoon.jpg`, `3-unit-izba.jpg`, `4-unit-stonehouse.jpg`, `5-unit-stone-interior.jpg`, `6-unit-ravine-road.jpg`.

## Resultat per del

| Del | Bedömning |
|---|---|
| Konceptbild | Följer beställningen: bygata väst–öst, kolchosgård med stenbyggnad och ladugård i nordost, ravin i öster, åkrar i väster och björkskog i norr. Ljuset är rätt. Bra underlag för kartan. |
| `ground-grass-dry` | Bra. Sömlös (skarv 2,7 mot 11,2 inuti), ingen synlig upprepning vid 3 × 3, och soldaterna syns tydligt mot den. |
| `ground-yard` | Bra och sömlös. Något enfärgad, men det fungerar som gårdsplan. |
| `ground-field-ploughed` | Sömlös, men **fårorna ligger cirka 2 m isär och har för hög kontrast**. På översiktsnivån ser åkern ut som en svart randig matta och drar till sig blicken. |
| `road-dirt-main` | Mycket bra. Sömlös längs x, rätt bredd (6 m) och tydlig i alla nivåer. Gräskanten är lite grönare än `ground-grass-dry`. |
| `bldg-izba-a` | Tak och interiör är bra. Ljuset är rätt, och dörrar, fönster och mellanvägg stämmer med manifestet. Byggnaden ser liten ut bredvid soldaterna, eftersom soldaterna är ritade i dubbel storlek. Det följer beställningen. |
| `bldg-stone-office` | Tak och interiör är bra: tydlig korridor, fyra rum och trappa. **Tak och interiör väger 3,3 MB tillsammans (budgeten är 1,5 MB).** |
| `tree-birch-1` | Fin krona med rätt skuggriktning. Den är ganska gulgrön, och på översiktsnivån ser den ut som en buske. Det går an för en björk. |
| `haystack-1` | Bra. Bildrutan är 60 enheter, men footprint är 40 enheter, alltså inom beställningen. |
| `fence-wattle-*` | Utseendet är bra. **Delarna passar inte ihop:** hörnets ankare ligger cirka 10 px (1,7 enheter) från stängselns mittlinje, där de raka delarna har sin mittlinje. Därför blir det ett hack i varje hörn. Mittlinjen ligger inte heller mitt i bilden, så en del som vänds 180° hamnar förskjuten. Hörnets utgång (den andra anslutningen) saknas i manifestet. |
| `ravine-edge-straight` | Sömlös, men **upprepningen syns tydligt**: samma rännor kommer var 8:e meter. Två kanter mot varandra ser ut som två remsor, inte som en ravin. Ravinbotten (`ravine-floor`) saknas i omgång 1, som avsett. |

**Teknik**

- **Storlekar:** alla stämmer med manifestet.
- **Total storlek:** 10,5 MB utan konceptbilden (budgeten är 12 MB).
- **Alfa:** högsta alfa är 253–254 i de flesta bilder, så objekten är 0,5–1 % genomskinliga. Spelet kan rätta det vid import, men det bör rättas i källan.
- **Färgfransar:** det finns röda och gula färgvärden i halvgenomskinliga kantpixlar. Det syns inte i spelvyn, men är fel enligt briefen.

## Återkoppling till GPT (v2 av stilprovet, innan omgång 2)

1. **Plöjd åker:** lägg fårorna cirka 0,7 m isär (7 enheter, 28 px) och sänk kontrasten tydligt, så att åkern läses som mark och inte som ett mönster. Lägg gärna in lite variation: halmrester och ojämna fåror.
2. **Ravinkant:** leverera segmenten 320 enheter långa (1920 × 360 px) och i 3 varianter som går att blanda, så att upprepningen inte syns. Lägg till `ravine-floor` i v2, så att ravinen kan provas som helhet. Ett ytterhörn och ett innerhörn behövs i omgång 2.
3. **Flätstaket:**
   - Lägg mittlinjen exakt i bildens mitt (y = pixelhöjd / 2) i alla delar, även hörnet.
   - Ange både in- och utgång i manifestet: `connectors: [{pixel:[x,y], dir:"w"}, {pixel:[x,y], dir:"s"}]`.
   - Hörnet ska svänga på samma mittlinje som de raka delarna.
4. **Alfa:** helt täckande pixlar ska ha alfa 255. Kantpixlar ska ha samma färg som objektet. Ingen röd, gul eller svart färg får ligga under alfa 0.
5. **Storlek:** leverera tak och interiör som WebP med alfa, eller kvantiserad PNG, så att stenbyggnaden håller budgeten på högst 1,5 MB.
6. **Vägkant:** gräset i vägens kant ska ha samma färgton som `ground-grass-dry`.
7. **Leverans:** skicka en zip-fil `REQUEST_005-v2` med filnamnen enligt manifestet, `overview.png` och `INTEGRATION.md`.

Delarna som fungerar ska inte göras om: konceptbilden, gräs, gårdsplan, väg, izba, stenbyggnad, björk och höstack. De kan gå vidare till omgång 2 i samma stil när Björn har godkänt stilen.

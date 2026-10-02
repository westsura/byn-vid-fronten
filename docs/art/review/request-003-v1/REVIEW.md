# Speltest: REQUEST_003-v1 (gångcykel, pilot: tysk gevärsskytt)

Datum: 2026-10-01 · Granskat av: Claude · Status: **EJ GODKÄNT.** Björn har inte provspelat.

## Så provas det

Öppna `?art=pilot-w1&side=german` (eller `&side=soviet`). I grafikväljaren heter läget *GRAFIKPROV GÅNGCYKEL tysk gevärsskytt (REQUEST_003)*.

- Bara tyska Schütze med K98k går med animation, 5 soldater per tysk grupp.
- Alla andra figurer är som i `pilot-r2`.
- Jämför med `?art=pilot-r2&side=german`, där samma soldater glider i redo-ställning.

## Integration

**Filer**

- Arket (4 × 2 rutor) och manifestet är kopierade **oförändrade** till `dist/assets/prototype/walk-pilot-v1/`.
- `source/reference.png` i paketet är byte för byte identisk med den godkända gevärsskytten (hjälm 2).

**Motorn**

- **Sträckräknare per soldat (`walked`).** Varje soldat räknar sin faktiskt tillryggalagda sträcka och står still när soldaten står still eller spelet är pausat.
  - Startvärdet förskjuts per soldat, så att gruppen inte går i takt.
- **Bildruta:** `floor((walked mod 28) / 28 × 8)`, enligt manifestets `cycleDistanceUnits` = 28.
  - Vid stillastående och vid liggande visas de befintliga redo- och liggande-bilderna.
  - Skott under gång använder gångrutan. Mynningen ligger på samma punkt i alla rutor.
- **Tester:** 48 tester går igenom, varav 2 nya i `tests/walk-cycle.test.js`. De kontrollerar:
  - att manifestets rutor har samma pivot, hjälm och mynning;
  - att sträckräknaren följer verklig förflyttning;
  - att räknaren står still vid paus och stopp.
- **Prestanda:** steg + ritning tar cirka 6,4 ms per bildruta med 33 soldater i rörelse, mot 6,8 ms utan gångcykel. Det är ingen mätbar skillnad.

## Kontroller enligt beställningen

**1. Åtta rutor, fast axelpunkt, 28 px/enhet** (`1-rutor-…-6x.jpg`) – **uppfyllt**

- Överkroppen är den godkända redo-bilden, pixelidentisk i alla rutor.
- Axelpunkt, hjälm och mynning står helt still.

**2. Fotglidning** (`3-stodfot-varldsposition.json`, `2-gang-4x-gras.gif`) – **inte uppfyllt, som leverantören själv varnar för**

- Jag räknade stödfotens position på marken bildruta för bildruta vid 30 enheter/s.
  - Inom ett steg flyttar sig foten fram och tillbaka cirka 3 enheter: med kroppen, och sedan tillbaka vid rutbytet.
  - Mellan rutbytena står den på rätt plats, och steglängden är jämn (14 enheter per steg).
- Vid normal zoom är 3 enheter ungefär 3 skärmpixlar. Vid 4× är det cirka 12 pixlar.
- Det syns främst som att stöveln "hackar" när man följer en enskild soldat i förstoring.
- **Orsak:** bara 8 fasta rutor för en kontinuerlig rörelse.

**3. Gevär och mynning** – **uppfyllt**

Inget hopp mellan gång, redo och skott, eftersom överkroppen är densamma.

**4. Rörelsen syns vid normal zoom** (`4-grupp-gar-normalzoom-gangcykel.gif`) – **knappt**

- Benen ligger nästan helt dolda under överkroppen och packningen. Bara stövlarna sticker fram, cirka 3–4 enheter framför och bakom kroppen.
- Vid normal zoom är det 2–3 pixlar som växlar. Gruppen ser fortfarande mest ut att glida.
- Vid 4× syns stövlarna växla fram och bak (`4-grupp-gar-4x-gangcykel.gif`, jämför `…-utan-gangcykel.gif`).
- Rörelsen är realistisk rakt ovanifrån, men ger lite liv i spelets storlek.

**5. Prestanda** – **uppfyllt**

Se ovan.

## Grafikfel och iakttagelser (att skicka till grafikproduktionen)

1. **För lite synlig rörelse vid normal zoom.**
   - Rakt ovanifrån döljer överkroppen benen.
   - Om gången ska läsas i spelets storlek behövs en tydligare silhuett:
     - längre steg, så att stövlarna syns tydligare framför och bakom;
     - en lätt axel- och höftvridning, som TILL-CLAUDE själv nämner saknas;
     - eventuellt en liten gungning av vapnet.
   - Björn bör avgöra om det behövs. Det är en smaksak hur mycket som ska överdrivas.
2. **Fotglidning mellan rutorna.** Två vägar:
   - **a. Fler rutor.** 16 rutor halverar hacket till cirka 1,5 enheter. Kräver bara ny atlas.
   - **b. Ben som eget lager (min rekommendation).** Leverantören bygger redan bilden av en överkropp och ett benlager (`source/legs.png`, `source/build-atlas.cjs`).
     - Om benen levereras som en egen atlas under den oförändrade överkroppen kan motorn skjuta benlagret bakåt i takt med kroppen inom varje ruta.
     - Stödfoten står då helt still på marken, med samma 8 rutor.
     - Det är en liten ändring i leveransen och en liten ändring i motorn.
3. **Stel rörelse.** Ingen axelvridning, vilket leverantören själv redovisar. Märks främst vid 4×.

## Integration och begränsningar (hos Claude)

1. Bara tysk Schütze. Övriga roller och sovjetiska figurer glider i redo-ställning.
2. Krypning saknas fortfarande. Liggande soldater som förflyttar sig visar den liggande bilden.
3. Sidoförflyttning från avståndshållningen inom gruppen räknas in i sträckan. Gångcykeln kan då ticka lite även när soldaten trängs åt sidan. Det märks inte.

## Filer

| Fil | Innehåll |
|---|---|
| `1-rutor-0-7-0-och-45-grader-6x.jpg` | Rutorna 0–7, ritade av spelet, vid 0° och 45°, 6× |
| `2-gang-4x-gras.gif`, `2-gang-4x-snett.gif` | En soldat som går 30 enheter/s över gräs, 4×, rakt och snett |
| `3-stodfot-varldsposition.json` | Stödfotens beräknade markposition per spelsteg: steg, sträcka, fot, x, y |
| `4-grupp-gar-4x-gangcykel.gif`, `4-grupp-gar-4x-utan-gangcykel.gif` | Hel tiomannagrupp som går, 4×, med och utan gångcykel |
| `4-grupp-gar-normalzoom-gangcykel.gif` | Samma grupp i normal zoom |
| `5-normalzoom-tysk.jpg` | Spelet i normal zoom i läget `pilot-w1` |

> **2026-10-02:** GIF-inspelningarna som nämns här är borttagna ur repot för att hålla nere storleken. De skickades till Björn i chatten. Nya GIF-filer läggs inte i repot.

# Speltest: infantry-rifleman-pilot-v3

Datum: 2026-09-30 · Granskat av: Claude · Status: **GRAFIKPROV V3 – EJ GODKÄNT.** Björn har inte provspelat.

## Så provas det

Välj *GRAFIKPROV V3 gevärsskytt* i grafikväljaren, eller öppna en av adresserna:

- `?art=pilot-v3&side=soviet` eller `&side=german` – standardskala och liten kontaktskugga.
- Lägg till `&scale=helmet` för hjälmmatchad skala. Märket visar då "· HJÄLMSKALA".
- Lägg till `&shadow=none`, `&shadow=small` (standard) eller `&shadow=oval` för att jämföra skuggor.

Standardgrafiken, v1 och v2 finns kvar oförändrade.

## Integration

- De två bildarken, manifestet och `draw-soldier.js` är kopierade **oförändrade** till `dist/assets/prototype/rifleman-pilot-v3/`. Ingen utfyllnad är beskuren och ingen pixel rensad.
- Ritningen följer leverantörens `draw-soldier.js`:
  - `sourceRect` per ställning.
  - `pivot` och `muzzle` relativt utsnittet.
  - Rotation med `heading − sourceForwardRadians` och skalning med `1 / pixelsPerUnit`.
  - `pixelsPerUnitHelmetMatched` används bara när `&scale=helmet` anges, aldrig tyst som standard.
- Omfattningen är densamma som i v2:
  - Bara tysk *Schütze* med K98k och sovjetisk *Rifleman* med M1891/30.
  - Övriga roller och utslagna soldater visas med v1-figurer.
  - Gång och kryp är spärrade.
  - Grupporganisationen är oförändrad.
- Mynningsflamman ritas från manifestets `muzzle`.

## Kontroller som begärdes i TILL-CLAUDE

| Kontroll | Resultat |
|---|---|
| Kroppens riktning | **Rättad.** Axlarna ligger nu tvärs mot vapnet, fötterna döljs under kroppen i redo och benen går bakåt i liggande. Soldaten ser ut att vara vänd åt samma håll som han siktar, i alla åtta riktningar och för båda sidor (`3a`, `3c`). |
| Vapen och riktning | Vapnet ligger längs spelets riktningslinje i alla åtta riktningar, i båda ställningarna och för båda sidor. |
| Pivot och hjälmcentrum | Pivoten (axelmitten) ligger stabilt och hjälmen sitter strax framför i båda ställningarna. |
| Hopp vid byte redo ↔ liggande (`5-byte-redo-liggande.gif`) | **Hjälmen:** hoppar knappt, 0,5 enheter för tysk och 0,2 för sovjetisk. En tydlig förbättring mot v2, där hoppet var cirka 3 enheter. **Mynningen:** flyttas 4,9 enheter bakåt för tysk och 2,9 för sovjetisk, och sidledes 0,9 respektive 0,7. Syns som att geväret "krymper" när soldaten lägger sig. |
| Standardskala eller hjälmmatchad skala (`3a` mot `3b`, `1a` mot `1b`) | **Rekommendation: standardskala.** Standard ger jämna totalmått: redo 27,1 (tysk) och 25,3 (sovjetisk), liggande 32,1 och 32,0. Hjälmmatchad skala ger ojämna mått: tysk redo krymper till 18,5 enheter medan sovjetisk liggande växer till 37,7. Hjälmstorleken bör rättas i bilden och inte med skalan. |
| Markskugga (`4-skuggor-ingen-liten-oval-4x.jpg`, uppifrån: ingen, liten, oval) | **Liten eller ingen.** Vid normalzoom är den lilla kontaktskuggan nästan omärklig, alltså nästan samma som ingen skugga. Den ovala skuggan ger tydligt intryck av spelbricka, som leverantören befarade. Den lilla är satt som standard. Den kan göras något kraftigare om figurerna upplevs sväva. |

## Grafikfel (att skicka till grafikproduktionen)

1. **Hjälmstorleken skiljer sig mellan sidorna** vid samma skala.
   - Tysk redo har hjälmdiameter 6,6 enheter mot sovjetisk 4,9 (+34 %). I liggande är det 5,2 mot 3,8.
   - Även inom samma sida är hjälmen cirka 20 % mindre i liggande än i redo.
   - Den tyska hjälmen ser märkbart stor ut i 4× (`3a`, rad Tysk redo).
2. **Mynningens avstånd skiljer sig mellan redo och liggande.** Det är 20,2 mot 15,3 enheter för tysk och 19,2 mot 16,4 för sovjetisk. Geväret bör vara lika långt fram räknat från axelmitten i båda ställningarna.
3. **Kroppen är liten i förhållande till geväret.**
   - Redo-figurens kropp är bara cirka 10–12 enheter bred, mot 16 för den kodritade soldaten och cirka 24 för v1-figurerna.
   - Vid normalzoom blir en v3-skytt en liten klump med ett långt gevär, och han ser betydligt mindre ut än specialisterna bredvid (`2-terrang-standardskala-4x.jpg`).
   - Frågan är om kroppen ska få större skala, alltså 28 enheter utan att räkna geväret, eller om v1-specialisterna ska krympas när de görs om.
4. **Sovjetisk khaki mot grusväg** är fortfarande den svagaste kontrasten, men läsbar tack vare den mörka hjälmen.
5. **Stilskillnad mot v1-specialisterna i samma grupp.** Detta är väntat tills specialisterna görs om i v3-stil.

## Integrationsfel och begränsningar (hos Claude)

1. **Gevären når fram till grannen.** Formationens avstånd (20 enheter) räcker inte eftersom geväret når 19–20 enheter framför axeln. Formationen kan luckras upp, men det är inte ändrat.
2. **Utslagen skytt visas med v1-figur**, eftersom v3 saknar den ställningen.
3. **Inne i hus ritas soldaterna stående** medan spelreglerna räknar dem som liggande. Oförändrat sedan v1.
4. **Skuggvalet gäller bara v3-skyttarna.** V1-figurerna i samma grupp har kvar den ovala skuggan.

## Filer

| Fil | Innehåll |
|---|---|
| `1a-normalzoom-standardskala.jpg`, `1b-normalzoom-hjalmskala.jpg` | Hela spelet i normalzoom, grupper på väg, gräs och vegetation |
| `2-terrang-standardskala-4x.jpg` | Spelets pixlar 4× på väg och i vegetation, båda sidor |
| `3a-riktningar-standardskala-4x.jpg` | 8 riktningar × redo, liggande och eld. Gult kors = pivot, blå ring = hjälmcentrum, röd prick = mynning |
| `3b-riktningar-hjalmskala-4x.jpg` | Samma med hjälmmatchad skala |
| `3c-riktningar-pa-vag-4x.jpg` | 8 riktningar på grusväg utan markeringar |
| `4-skuggor-ingen-liten-oval-4x.jpg` | Skuggvarianter uppifrån: ingen, liten, oval (väg till vänster, vegetation till höger) |
| `5-byte-redo-liggande.gif` | Byte mellan redo och liggande med pivot, hjälmcentrum och mynning markerade |
| `6-strid-*.jpg` | Tysk sida i pågående strid |

> **2026-10-02:** GIF-inspelningarna som nämns här är borttagna ur repot för att hålla nere storleken. De skickades till Björn i chatten. Nya GIF-filer läggs inte i repot.

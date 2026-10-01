# Speltest: REQUEST_002-v1 (sovjetiska specialister, utslagna, registrering)

Datum: 2026-10-01 · Granskat av: Claude · Status: **EJ GODKÄNT.** Björn har inte provspelat paketet.

## Så provas det

Öppna `?art=pilot-r2&side=soviet` (eller `&side=german`). I grafikväljaren heter läget *GRAFIKPROV BÅDA GRUPPERNA + UTSLAGNA (REQUEST_002)*. Märket lyder "GRAFIKPROV V4 · BÅDA GRUPPERNA + UTSLAGNA (REQUEST_002) – EJ GODKÄNT".

| Tillägg i adressen | Effekt |
|---|---|
| `&reg=v4` | Den sovjetiska gevärsskytten ritas med den gamla v4-registreringen, för jämförelse |
| `&spacing=wide` | Formationsavstånd × 1,5 |

Tidigare lägen (standard, v1–v4, pilot-h2, pilot-s1) finns kvar och laddar utan fel.

## Integration

**Filer och kontrollsummor**

- Sex ark, manifestet och `soviet-rifleman-registration.json` är kopierade **oförändrade** till `dist/assets/prototype/request-002-v1/`.
- Kontrollsummorna stämmer med paketets `checksums.json`.
- Referensbilderna i paketet är byte för byte identiska med de bilder som redan används.

**Grafik per roll i `pilot-r2`**

Alla 21 soldater har nu v4-grafik i redo och liggande.

| Sida | Roll | Grafik |
|---|---|---|
| Sovjet | Squad Leader | Ny, gruppchef med PPSh |
| Sovjet | Machine Gunner | Ny, DP |
| Sovjet | Assistant Gunner | Ny |
| Sovjet | Senior Rifleman, Rifleman med SVT-40 | Ny, SVT (2 soldater) |
| Sovjet | Rifleman med M1891/30 | V4-bilden med ny registrering (6 soldater) |
| Tysk | Alla tio roller | Som i `pilot-s1` |

**Utslagna**

- Båda sidor har nya utslagna figurer.
- Variant a och b växlar inom gruppen, så att två bredvid varandra är olika.
- Spelet ritar dem med 80 % opacitet.

**Ändringar i motorn**

- Utslagna ritas nu **före** alla levande soldater på kartan, i alla grafiklägen. Tidigare kunde en stupad hamna ovanpå en levande soldat från en annan grupp.
- Soldaterna har fått ett löpnummer (`idx`) som används för att välja variant. Spelreglerna är oförändrade.

**Tester:** 46 tester går igenom, varav 5 nya i `tests/pilot-r2.test.js`. De nya testerna kontrollerar att:

- alla 21 soldater har bildrutor för redo och liggande;
- båda utslagna varianterna finns per sida och har rimlig placeringspunkt;
- mynningen ligger mindre än 0,5 enheter från skottlinjen i alla levande figurer.

## Kontroller enligt beställning och TILL-CLAUDE

**1. Kropp och hjälmstorlek, specialisterna** (`2-sovjet-alla-roller-narbild-8x.jpg`)

Samma kropp, hjälm och färgton som v4-gevärsskytten i båda poserna. Ingen figur sticker ut. Gruppen ser enhetlig ut, som den tyska.

**2. Riktning, rotationspunkt och mynning** (`1a`, `1b`, `1c`)

- Alla vapen följer riktningslinjen i åtta riktningar.
- Mynningsflamman hamnar vid mynningen.
- Bytet mellan redo och liggande ligger inom gränserna enligt leverantörens beräkning. SVT ligger närmast gränsen: mynningen flyttar 0,96 enheter i längsled. Det märks inte i spelet.

**3. Kulsprutelaget vid 4×** (`4-4x-…`, `1a`)

- **Godkänt.** DP:s runda skivmagasin syns tydligt vid 4× och anas som en mörk prick även vid normal zoom.
- Det är första gången en roll går att känna igen på kartan utan gränssnittet.
- Assistentens rundade väska och synliga magasin syns först vid cirka 8×.
- Gruppchefens PPSh med trummagasin syns vid 4× men är svårare att se än DP.

**4. Utslagna mot liggande** (`5a`, `5b`, `6-…`)

Utslagna går att skilja från liggande på väg och gräs vid 4×. Vid normal zoom och i strid går de också att skilja åt. Skälen:

- de är kortare än en liggande figur;
- geväret ligger snett bredvid kroppen;
- de har oregelbunden kontur och är lätt nedtonade.

I mörk vegetation är de svåra att se, men det är rimligt för stupade.

**5. Den sovjetiska gevärsskyttens registrering** (`1d-…-fore-efter-4x.jpg`)

Med de nya värdena går geväret längs riktningslinjen i stället för parallellt vid sidan om den.

Som leverantören påpekar är rotationspunkten nu förskjuten cirka 1,6 enheter från den anatomiska axelmitten mot vapnet. Kroppen ligger alltså något vid sidan av soldatens spelposition. Det syns inte vid normal zoom.

Jag rekommenderar att behålla leverantörens lösning:

- Alla sovjetiska figurer följer nu samma princip.
- En separat skottlinje i motorn skulle ge samma bild men mer kod.

Min gräns på 0,5 enheter i beställningen var striktare än spelet behöver. Den gamla avvikelsen på 1,4–1,9 enheter syntes bara vid 4×.

## Grafikfel och iakttagelser (att skicka till grafikproduktionen)

1. **Den tyska utslagna hjälmen är för stor och för rund** (`8-utslagna-mot-levande-kalla.jpg`, övre raden).
   - Leverantörens egen mätfil anger 5,5 enheter, mot 4,4 för de levande tyska figurerna, alltså cirka 25 % större.
   - Formen liknar den äldre hjälmen före hjälmkorrigering 2, med större kupa och utan den kompakta nackkanten.
   - Axlarna ser också något bredare ut än hos den levande figuren.
   - De sovjetiska utslagna stämmer med 4,3–4,5 enheter.
   - Vid normal zoom märks det knappt, men det syns vid 4× och bör rättas när de tyska utslagna görs om eller när gångcykeln görs.
2. **Utslagna med kulspruta** saknas (förslag i beställningen, inte levererat). Den sovjetiska kulspruteskytten och den tyska MG-skytten faller med ett gevär bredvid sig. Det märks bara vid förstoring.
3. **Gruppchefens PPSh** är kort och syns mindre än DP. Det är acceptabelt, eftersom gruppchefen markeras i gränssnittet.
4. **Kantkontrast mot grusväg** är oförändrad. Förslaget om kantljus ingick inte i leveransen, med motiveringen att referensens färgton hålls gemensam. Sovjetisk khaki är fortfarande svagast mot väg.
5. **Kvar sedan tidigare:**
   - Gång och kryp saknas. De är beställda i `REQUEST_003`.
   - Alfakanterna är inte slutrensade. Inga synliga rester i spelet.

## Integration och begränsningar (hos Claude)

1. **Formationen:** liggande soldater i kedjor, huvud mot fötter. Oförändrat, planerat i fas B.
2. **Inne i hus** ritas soldaterna stående medan reglerna räknar dem som liggande. Oförändrat.
3. **Utslagna inne i hus** ritas som utslagna och kan överlappa varandra vid många förluster. Det är inte kontrollerat särskilt.

## Filer

| Fil | Innehåll |
|---|---|
| `1a-redo-…`, `1b-liggande-…` | Sovjetiska roller i 8 riktningar, med gevärsskytten v4 överst. Gult kors = rotationspunkt, blå ring = hjälm, röd prick = mynning, röd linje = riktning |
| `1c-eld-flamma-4x.jpg` | Liggande eld med mynningsflamma |
| `1d-sovjet-gevarsskytt-registrering-fore-efter-4x.jpg` | Gevärsskytten med gammal respektive ny registrering, redo och liggande |
| `2-sovjet-alla-roller-narbild-8x.jpg` | Gevärsskytt, gruppchef, kulspruteskytt, assistent och SVT-skytt, redo och liggande, 8× |
| `3-normalzoom-standard.jpg`, `3-normalzoom-brett.jpg` | Hela spelet i normal zoom, sovjetisk sida |
| `4-4x-…` | Elvamannagrupp på väg, gräs (liggande) och i mörk vegetation, 4× |
| `5a-…`, `5b-…` | Utslagna a och b i 8 riktningar, som de ritas i spelet |
| `6-utslagna-normalzoom.jpg`, `6-4x-…` | Grupper med fyra utslagna bland levande, båda sidor |
| `7-strid-soviet-normalzoom.jpg`, `7-strid-*-2x.jpg`, `7-strid-*.gif` | Pågående strid med förluster, båda sidor. GIF-filerna är korta rörelseinspelningar |
| `8-utslagna-mot-levande-kalla.jpg` | Källbilderna i samma skala: levande gevärsskytt till vänster, utslagna a och b till höger |

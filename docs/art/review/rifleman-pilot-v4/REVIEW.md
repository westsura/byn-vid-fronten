# Speltest: infantry-rifleman-pilot-v4

Datum: 2026-10-01 · Granskat av: Claude · Status: **GRAFIKPROV V4 – EJ GODKÄNT.** Björn har inte provspelat.

**Uppdatering 2026-10-01:** Björn har provspelat och godkänt stilen som grund för fortsatt grafik. Läget är fortfarande ett valbart prov; produktionsgodkännande av helheten väntar på utslagna, sovjetiska specialister och animationer.

## Så provas det

Välj *GRAFIKPROV V4 gevärsskytt* i grafikväljaren, eller öppna en av adresserna:

- `?art=pilot-v4&side=soviet` eller `&side=german` – samma skala (28 px per enhet) i alla fyra poser, liten kontaktskugga.
- Lägg till `&spacing=wide` för att prova formationsavstånd × 1,5. Märket visar då "· AVSTÅND ×1.5".
- Lägg till `&shadow=none` eller `&shadow=oval` för att jämföra skuggor.

Standardgrafiken, v1, v2 och v3 finns kvar oförändrade.

## Integration

- Arken, manifestet och `draw-soldier.js` (identisk med v3) är kopierade **oförändrade** till `dist/assets/prototype/rifleman-pilot-v4/`.
- Ritningen sker med `sourceRect` och koordinater relativt utsnittet. Hela utsnittet ritas, inklusive utfyllnaden.
- Samma skalfaktor används i alla poser. Liggande figur har **inte** justerats ned till 32 enheter.
- Omfattningen är som tidigare:
  - Bara Schütze med K98k och Rifleman med M1891/30.
  - Gång och kryp är spärrade.
  - Utslagna visas med v1-figur.
- Nytt i motorn: formationsavståndet kan skalas per läge (`&spacing=wide`). Standardläget och övriga lägen påverkas inte, och alla 41 tester går igenom.

## Kontroller enligt TILL-CLAUDE

**V4 för sig, utan v1-figurer** (`0a`, `0b`, `0c`)

- Proportionerna hänger ihop nu. Axlar, hjälm och gevär har samma storlek i redo och liggande.
- Den liggande figuren blir längre bara för att benen syns.
- Båda sidor är läsbara på väg, gräs och mörk vegetation vid normalzoom. Svagast är fortfarande sovjetisk khaki mot grusväg.

**Byte redo ↔ liggande med fast axelpunkt** (`5-byte-redo-liggande-4x.jpg`, `.gif`)

- **Hjälmen** flyttas 0,4 enheter för tysk och 0,1 för sovjetisk.
- **Mynningen** flyttas 0,3 för tysk och 0,3 för sovjetisk, räknat framåt.
- Bytet ser stabilt ut. Det är den största förbättringen hittills: i v3 flyttades mynningen 3–5 enheter.

**Åtta riktningar och mynningsflamma** (`3a`, `3b`)

- Vapnet följer riktningen i alla riktningar och båda ställningarna.
- Pivot och hjälmcentrum ligger stabilt.
- Flamman hamnar vid mynningen.

**Mått beräknade från manifestet vid 28 px per enhet**

| | Tysk redo | Tysk liggande | Sovjet redo | Sovjet liggande |
|---|---:|---:|---:|---:|
| Axel → mynning, framåt | 18,2 | 18,5 | 20,8 | 20,6 |
| Mynning i sidled från axellinjen | 0,4 | 0,2 | **1,9** | **1,4** |
| Axel → hjälmcentrum, framåt | 2,1 | 2,5 | 2,1 | 2,0 |

Hjälmbredden är cirka 4,4–4,6 enheter i alla poser enligt leverantörens mätning. I spelet ser hjälmarna lika stora ut mellan sidorna. Gevärslängden (Mosin cirka 15 % längre än K98k) ser rimlig ut.

**Längd mot hus** (`4-langd-mot-hus-4x.jpg`)

- En liggande skytt (cirka 40 enheter) är ungefär lika lång som husdörren (38 enheter) och en tredjedel av Västra husets bredd.
- Det stämmer med spelets medvetet överdrivna soldatskala. Jag ser inget skäl att ändra den globala faktorn.

**Skugga** (`4b-skuggor-ingen-liten-oval-4x.jpg`)

- Ingen skugga och liten skugga är nästan lika vid normalzoom.
- Den ovala skuggan ger spelbrickeintryck.
- Den lilla skuggan är satt som standard.

## Grafikfel (att skicka till grafikproduktionen)

1. **Sovjetisk mynning ligger 1,4–1,9 enheter i sidled** från axellinjen, mot 0,2–0,4 för tysk. Geväret pekar parallellt med riktningen men förskjutet åt höger. Det syns vid 4× men knappt vid normalzoom. Axelmitten i manifestet kan behöva justeras i stället för bilden.
2. **Sovjetisk khaki mot grusväg** är fortfarande den svagaste kontrasten.
3. **Stilen skiljer sig från v1-specialisterna** i den blandade gruppen (`1a`, `2a`–`2c`). V1-figurerna är klart större, med stora packningar. Det försvinner först när specialistrollerna görs om i v4-proportioner.
4. **Kvar sedan tidigare:** gång, kryp, utslagen och specialistroller saknas, och alfakanterna är inte slutrensade. Inga alfarester syns i spelet vid normalzoom.

## Integrationsfel och bedömning av formationen (hos Claude)

1. **Formationen passar inte liggande v4-figurer.**
   - Soldaterna står i ett rutnät med 20 enheters steg i x och 23 i y. Rutnätet följer inte gruppens riktning.
   - Liggande figurer är cirka 40 enheter långa och ligger därför huvud mot fötter i långa kedjor, både med standardavstånd (`0a`) och med × 1,5 (`0b`).
   - Stående figurer fungerar med × 1,5 men gevären når grannen vid standardavstånd.
   - **Förslag:** en formation som vrids efter gruppens riktning. Soldaterna ligger då bredvid varandra i sidled med cirka 15–18 enheters mellanrum och har cirka 45 enheters djup mellan leden när de ligger ned.
   - Det är en motorändring för fas B och inte gjord i detta prov.
2. **Utslagen v4-skytt byter till v1-figur.**
3. **Inne i hus ritas soldaterna stående** medan spelreglerna räknar dem som liggande. Oförändrat.
4. **Skuggvalet gäller bara v4-skyttarna**, inte v1-figurerna i samma grupp.

## Filer

| Fil | Innehåll |
|---|---|
| `0a-endast-v4-standardavstand-4x.jpg`, `0b-endast-v4-brett-avstand-4x.jpg` | Grupper med bara v4-skyttar, 4×: väg, mörk vegetation, gräs (liggande), tysk på väg och i buskage |
| `0c-endast-v4-normalzoom.jpg` | Samma som ovan, hela kartan i normalzoom |
| `1a-blandad-grupp-normalzoom.jpg`, `1b-…-brett-avstand-…` | Riktiga blandade grupper (v4-skyttar och v1-specialister) i spelet |
| `2a`–`2c` | Blandade grupper, 4× |
| `3a-atta-riktningar-markerade-4x.jpg` | 8 riktningar × redo, liggande och eld. Gult kors = axelpunkt, blå ring = hjälm, röd prick = mynning |
| `3b-atta-riktningar-vag-4x.jpg` | 8 riktningar på grusväg utan markeringar |
| `4-langd-mot-hus-4x.jpg` | Redo och liggande bredvid Västra husets dörr |
| `4b-skuggor-ingen-liten-oval-4x.jpg` | Skuggvarianter uppifrån: ingen, liten, oval |
| `5-byte-redo-liggande-4x.jpg`, `5-byte-redo-liggande.gif` | Byte med fast axelpunkt, markerade punkter |
| `6-strid-tysk-normalzoom.jpg` | Tysk sida i pågående strid |

> **2026-10-02:** GIF-inspelningarna som nämns här är borttagna ur repot för att hålla nere storleken. De skickades till Björn i chatten. Nya GIF-filer läggs inte i repot.

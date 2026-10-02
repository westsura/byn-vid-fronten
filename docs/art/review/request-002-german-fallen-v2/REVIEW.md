# Speltest: REQUEST_002-german-fallen-v2 (rättade tyska utslagna)

Datum: 2026-10-02 · Granskat av: Claude · Status: **EJ GODKÄNT.** Björn har inte provspelat.

## Så provas det

Den nya versionen används automatiskt i `?art=pilot-r2` och `?art=pilot-w1`. Lägg till `&fallen=v1` för att se de gamla tyska utslagna. Märket visar då "· TYSK UTSLAGEN V1".

## Integration

- `german-fallen.png` och manifestet är kopierade **oförändrade** till `dist/assets/prototype/request-002-german-fallen-v2/`.
- Kontrollsummorna i `SHA256SUMS.txt` stämmer.
- Referensbilderna är byte för byte identiska med tidigare leveranser.
- Bara de två tyska utslagna byts ut. Sovjetiska bilder och levande tyska figurer är oförändrade.
- Den nya placeringspunkten för variant a, [780, 395], används.
- Alla 48 tester går igenom. Testet för utslagna läser nu v2-manifestet för den tyska sidan.

## Kontroller

**Hjälmen** (`0-leverantorens-jamforelse-8x.png`, `1-…-v2-…`, jämför `1-…-v1-…`)

- Hjälmarna är nu kompakta, med samma flacka form och korta nackkant som hos den levande gevärsskytten. Klotformen är borta.
- Leverantörens mätning anger 4,5 och 4,8 enheter. Det stämmer med hur hjälmen ser ut bredvid den levande figuren.
- Leverantören påpekar med rätta att jämförelsetalet 4,4 i min granskning kom från v4-mätningarna och inte från hjälmkorrigering 2. Det avgörande är att formen och storleken nu ser lika ut i bilden, och det gör de.

**Anatomin, variant a**

- Rygg, bäcken och ben ligger nu i samma bukvända läge. Den vridna midjan är borta.

**Placering** (`1-…-v2-8-riktningar-4x.jpg`)

- Placeringspunkten ligger i bålen i båda varianterna och i alla åtta riktningar.
- De utslagna ligger på samma plats som den levande soldaten stod.

**I spelet** (`2-4x-…`, `3-normalzoom.jpg`)

- På väg och gräs läses de fortfarande tydligt som utslagna och skiljs från liggande.
- Skillnaden mot v1 syns bara vid förstoring. Vid normal zoom är den knappt märkbar.

## Grafikfel

Inga nya. Axelbredden ser normal ut bredvid levande figurer vid 4×.

## Filer

| Fil | Innehåll |
|---|---|
| `0-leverantorens-jamforelse-8x.png` | Leverantörens bild: levande, före, efter |
| `1-tysk-utslagen-v2-8-riktningar-4x.jpg`, `1-…-v1-…` | Ny respektive gammal version i 8 riktningar, som i spelet |
| `2-4x-v2-…`, `2-4x-v1-vag-redo.jpg` | Tysk grupp med fyra utslagna, 4×, ny respektive gammal version |
| `3-normalzoom.jpg` | Hela spelet i normal zoom |

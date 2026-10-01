# REQUEST_002 – integrationsunderlag

Nytt granskningspaket, inte användargodkänt. Fyra sovjetiska specialistark med redo/liggande och två utslagen-ark med två varianter per sida. Inga gång-/krypcykler eller nya spelregler ingår.

## Rollkoppling

- soviet-leader → Squad Leader (soviet-01), PPSh-41.
- soviet-mg → Machine Gunner (soviet-02), DP.
- soviet-assistant → Assistant Gunner (soviet-03), M1891/30 och magasinbärare.
- soviet-svt → Senior Rifleman samt Rifleman med SVT-40 (soviet-04 och -05).
- german-fallen-a/b respektive soviet-fallen-a/b → sidans utslagna, alla roller.

Använd manifestets verkliga sourceRect och lokala koordinater. Alla bilder ritas med 28 källpixlar per spelenhet. Vinkel 0 = höger, positiv vinkel = medurs. Normalisera inte figurstorlek efter bildens eller vapnets bredd. För utslagna är muzzle null och pivot ligger i bålen. Motorn sköter opacitet och sortering under levande figurer.

## Registrering

soviet-rifleman-registration.json gäller den oförändrade V4-bilden soviet-poses.png. Uppdatera endast dess registreringsvärden, inte bild, skala eller vapenregler. Reference-mappen innehåller oförändrade bilder för jämförelse.

Viktig geometrisk skillnad: vapnet ligger bredvid hjälmens centrum även i källbilden. För att uppfylla beställningens vapenlinje används en rotationspunkt förskjuten mot vapenlinjen. Den är inte längre en exakt anatomisk axelmitt. V4-punkten flyttas 46 källpixlar i y för redo och 40 för liggande, samt -4 i x för liggande. Figuren blir därmed något sidoförskjuten kring spelpositionen. Bilden ritas inte om. Om anatomisk axelmitt måste bevaras bör motorn i stället skilja kroppens ankare från vapnets parallella skottlinje; en enda pivot kan inte samtidigt centrera båda.

Samma princip används konsekvent för de nya levande figurerna. registration-checks.json redovisar den beräknade rörelsen mellan poser utifrån manuellt avlästa punkter. De matematiska värdena ersätter inte visuell verifiering av punkterna vid 4× och åtta riktningar.

## Granskning i spelet

Kontrollera framför allt kulsprutelagets läsbarhet vid 4×, specialisternas hjälm/kroppsskala bredvid V4 och att utslagna skiljs från liggande vid normalzoom på riktig terräng. Magasinbärarens rundade väska och synliga skivmagasin är avsiktliga rollmarkörer. Behåll tidigare grafikläge som reserv.

preview.html visar nya figurer och referenser i åtta riktningar vid 4×, med 1×-figurer vid namnen. Bakgrunderna är enfärgade kontrastprov. Slutlig terrängbedömning görs i spelet.

Valfria tillägg med särskild MG-utslagen och alternativ kantbelysning ingår inte. Referensens färgton hålls gemensam. Utrustning och vapen har genererade, stiliserade detaljer; ingen exakt historisk rekonstruktion garanteras. Godkänn efter provspelning, inte enbart efter mätfilen.

## Konkreta granskningspunkter

SVT-mynningen flyttar 0,964 enheter i längsled mellan poser, nära gränsen 1,0. Övriga numeriska värden finns i registration-checks.json. Utslagna upptar cirka 28–34 × 14–18 enheter och ligger under maxmåttet 45 × 30. Sovjetiska utslagen-arket använder delning vid y730; använd manifestet, inte standarddelningen y700.

Rörelsegränserna är verifierade mot de manuellt uppskattade punkterna. Bildkonturer, magasinens perspektiv och läsbarhet i strid behöver fortfarande godkännas visuellt. Några mycket svaga färgfransar kan finnas runt alpha-kanterna; ingen slutlig pixelrensning ingår.

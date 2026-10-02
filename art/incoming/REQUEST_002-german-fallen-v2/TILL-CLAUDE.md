# REQUEST_002 – korrigering av tyska utslagna, v2

Detta är ett kompletteringspaket till REQUEST_002-v1, efter REVIEW_11. Byt bara german-fallen.png och de två german-fallen-a/b-posterna i manifestet. Alla sovjetiska bilder, registreringsvärden och levande tyska figurer ligger kvar från tidigare paket. Gångpiloten REQUEST_003 påverkas inte.

Båda tyska utslagna har granskats mot den aktuella levande tyska gevärsskytten med hjälmkorrigering 2. Fokus är en mindre klotformad kupa, kort nackkant med bevarad kroppsskala. Efter Björns återkoppling korrigeras även den övre figurens anatomi: bröstkorg, midja och bäcken ska ligga sammanhängande i samma bukvända orientering, med benen böjda i markplanet. Varianten behåller löst gevär och slappa armar för att skiljas från skjutande liggande.

Skalan är fortsatt 28 källpixlar per spelenhet. Samma två utsnitt: [0,0,1254,700] och [0,700,1254,554]. muzzle är null, och motorn sköter opacitet/nedtoning. Rotationspunkterna är bålankare och inte hjälmcentrum.

Viktigt om REVIEW_11:s jämförelse: talet 4,4 enheter för levande hjälm kommer från äldre V4-mätningar. Den aktuella hjälmkorrigeringen har annan form och storlek. Därför har den aktuella PNG-referensen använts direkt; korrigeringen är inte en generell krympning med 25%. Se measurements.json för manuellt uppskattade tvåaxliga hjälmbounds, med angiven osäkerhet. En rundare hjälm kan se större ut trots liknande största bredd. Den första omritningen ändrade även kroppsskalan och kasserades. Slutversionen korrigerar hjälmarna på båda figurerna och anatomin i den övre posen. Axelbredd och läsbarhet behöver fortfarande bedömas i spelvyn.

preview.html visar gammal utslagen, ny utslagen och aktuell levande referens med samma skala. Granska båda varianterna vid normalzoom och 4× på väg/gräs/vegetation. Inga ändringar av spelregler, formationer eller lagerordning ingår. Paketet är ett nytt grafikprov, inte slutgodkänt.

Använd bilden tillsammans med det nya manifestet: övre variantens pivot har ändrats från [700,355] till [780,395], eftersom bålen flyttats. Nedre variantens pivot är fortsatt [730,230] i sitt utsnitt. Hjälmcentrum är uppdaterat för båda. Koordinaterna är manuellt registrerade och ännu inte verifierade i spelet.

Bilderna har korrigerats med inbyggd bildgenerering. Prompter och källhänvisning ingår. comparison-8x.png visar före/efter och aktuell levande referens med samma skala.

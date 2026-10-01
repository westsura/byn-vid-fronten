# REQUEST_003 – tysk gevärsskytt, gångpilot

Åtta rutor, fyra kolumner × två rader, varje utsnitt 1254 ×700. Använd sourceRect i manifestet. Skala 28 källpixlar per spelenhet. Cykellängd 28 enheter, alltså 3,5 enheter per ruta och cirka 8,57 bildrutor/s vid 30 enheter/s. Positiv vinkel roterar medurs,0 pekar höger.

Överkroppen är den oförändrade godkända redo-bilden, placerad ovanpå benlagret. Pivot[600,390], hjälm[659,385] och mynning[1115,400] är därför identiska i alla rutor. Ingen ny utrustning eller omritad hjälm. source/ innehåller referens och genererade benkomponenter för spårbarhet.

## Uppspelning

Index = floor((travelDistance % 28) / 28 * 8). Behåll sträckräknaren när soldaten pausar. Stoppa uppspelning när ingen sträcka tillkommer. Vid stillastående visas befintlig redo-bild; vid liggande visas befintlig liggande-bild. Piloten ändrar bara Schütze med K 98 k.

Ruta 0: vänster kontakt. Ruta 4: höger kontakt. Ruta 2 och 6: passerläge, båda fötterna under kroppen. Stödfoten förflyttas exakt 98 källpixlar bakåt per rutsteg (=3,5 spelenheter). Vid kontaktbyte byter plantedFoot sida; jämför inte den nya foten med den förra. feet och plantedFootSide finns som extra kontrollfält. Vid passerlägen kan stödfoten vara skymd av överkroppen.

## Viktig begränsning – diskret uppspelning

Markkontakt är matematiskt stabil vid de samplade rutpositionerna: kroppens +3,5 enheter och fotens -3,5 tar ut varandra. Det betyder inte perfekt kontinuerlig fotlåsning. Om motorn förflyttar kroppen kontinuerligt men håller en bildruta stilla mellan byten kan foten röra sig upp till knappt 3,5 enheter inom en ruta och sedan återställas. preview.html visar just denna ärliga uppspelning, utan dold positionskvantisering eller andra korrigeringar.

Kravet på ingen synlig fotglidning vid 4× är alltså INTE verifierat/garanterat av denna leverans. Godkänn inte det utifrån mätvärdena. Om glidningen stör behövs fler bildrutor eller kontinuerligt animerade ben med separata fotkontakter; att bara ändra plantedFoot-värden kan inte rätta pixlarna mellan rutbyten. Piloten levereras för den bedömningen.

Benrörelsen använder återanvända rasterdelar under kroppen, utan axelvridning. Den kan uppfattas stel; bedöm rytm, fotstorlek och läsbarhet i en hel grupp i normalzoom. Förhandsvisningen återkommer till banans start efter två cykler; det är en visningsloop, inte ett fel vid spelets cykelgräns.

## Filer och test

manifest.json och measurements.json innehåller åtta rutor. walk-strip-4 x.png visar rutorna vid exakt 4×. preview.html visar på stället och förflyttning,0°/45°,1×/4×, paus, stegval och hastighet 24–36. Bakgrunderna är enkla färg-/rutnätsprov.

Behåll tidigare grafikläge. Kontrollera faktisk fotglidning, stopp mot redo, skottpunkt och prestanda med 21 soldater i motorn. Paketet är animation-pilot-not-approved. Ingen krypning eller annan roll ingår.

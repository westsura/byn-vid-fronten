# Grafikprov V3 – arbetsversion, inte godkänd

## Vad provet omfattar

Använd endast *-poses-legfix.png. Två bildark med två poser vardera: tysk K98k-skytt och sovjetisk Mosin-skytt. Utrustning och kroppsriktning har bearbetats. Björns återkoppling under produktionen var att stående skyttens ben ska döljas under kroppen från den lodräta kameran, inte sträckas bakåt som i ett utfall. Den korrigeringen ingår i den senaste bildomgången.

V3 ska vara ett separat grafikval. Behåll v1/v2 och ändra inte grupporganisationen eller specialistrollerna. Ingen gång, krypning eller fallen-animation ingår.

## Nytt bildformat

Varje PNG är ett ark med två figurer. Använd sourceRect i manifestet. Pivot, muzzle och helmetCenter är RELATIVA till respektive utsnitt. Detta skiljer sig från att använda absoluta koordinater över hela arket. Rita enligt draw-soldier.js. Radera inte transparent padding och gör inte automatiska utsnitt.

Pivoten är en manuell uppskattning av axelmitten, inte hjälmens centrum. Mynning och hjälmcentrum är också uppskattningar som ska kontrolleras i spelet. measurements.json redovisar de beräknade avstånden utifrån dessa punkter, inte en oberoende anatomisk mätning.

## Skala: två jämförelser

Standard pixelsPerUnit behåller kroppsskalan från V3 före benkorrigeringen (då bredden var 28/32). De stående figurerna får nu mindre totalbredd när de utstickande benen försvunnit; vi förstorar inte överkroppen för att fylla ut samma bredd. pixelsPerUnitHelmetMatched är ett alternativ där uppskattad hjälmdiameter blir 4,5 spelenheter. Det senare ändrar soldaternas totala bredd och ska inte införas tyst som standard.

Det finns fortfarande skillnader i kroppens och hjälmens proportioner. Samma totalbredd garanterar inte samma kroppsskala. Förhandsvisningen gör skillnaden synlig; detta är inte löst med metadata och får inte beskrivas som färdigkalibrerade figurer.

## Markskuggor – förslag att testa i spelmotorn

Jämför först helt utan skugga. Testa sedan en liten, svag kontaktskugga nära kroppen. Undvik en sammanhängande mörk oval under hela geväret och kroppen, som ger intryck av en spelbricka. Förhandsvisningens lilla skugga är endast ett visuellt experiment; anpassa den efter posen i motorn.

## Nästa spelkontroll

Kontrollera åtta riktningar, byte redo/liggande med axelpunkt och hjälmcentrum markerade, samt normalzoom på väg och i vegetation. Redovisa eventuellt hopp vid byte och jämför de två skalningsalternativen. Behåll märkningen GRAFIKPROV V3 – EJ GODKÄNT. Bildändringen är inte en spelmotorändring och har inte provspelats här.

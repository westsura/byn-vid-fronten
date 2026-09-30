# Till Claude: isolerat gevärsskyttsprov v2

## Omfattning

Detta är ett grafikprov som svar på REVIEW_1–3 och skärmbilderna. Rapporterna är identiska och bildseriernas suffixkopior är identiska. Behåll nuvarande grafik som standard. Lägg dessa fyra bilder i ett separat valbart provläge; ersätt inte alla soldatroller med gevärsskytten.

Tysk Schütze med K98k och sovjetisk Rifleman med Mosin M1891/30, vardera ready/prone. Gruppdefinitionerna 10 respektive 11 man ändras inte. MG-, ledar-, pistol- och SVT-roller omfattas inte. Walk/crawl förblir spärrade. Inga nya fire/fallen-bilder levereras.

## Registrering

Läs manifest.json; antag inte samma skala eller pivot för varje bild. Hela PNG-filen är källrektangel. Alla koordinater är absoluta källpixlar. Positiv vinkel går medurs, noll pekar åt höger.

1. Flytta canvas till soldatens världspunkt.
2. Rotera med heading − sourceForwardRadians.
3. Skala med 1 / pixelsPerUnit (kamerazoom hanteras av motorn).
4. Rita hela bilden med övre vänstra hörnet vid −pivot.x, −pivot.y.

Mynningens lokala position är (muzzle − pivot) / pixelsPerUnit. Rotera den med samma vinkel och addera soldatens världspunkt. Kontrollera i åtta riktningar innan effekter kopplas in. Pivot och mynning är manuella uppskattningar, inte färdigkalibrerade fästpunkter.

Föreslagen bredd inklusive vapnet är 28 spelenheter för ready och 32 för prone, samma per sida. Detta är en avsiktlig visuell provskalning, inte en fysisk kroppsskala. Hjälmar och kroppsproportioner matchar därför ännu inte helt mellan ställningarna. Bedöm tillsammans med kartans verkliga skala innan värdena låses.

## Kvarvarande grafikarbete

- Ready visar fortfarande benen tydligt nedåt i bild medan vapnet pekar höger. Vapnets riktning har förbättrats, men kroppens riktning behöver bedömas och sannolikt bearbetas vidare.
- Utrustning, hjälmstorlek och kroppsskala varierar mellan ready och prone. Detta är inte en sammanhängande animationsserie.
- Nästan osynliga alpha-rester finns utanför figurerna. Inga pixlar har rensats med kod. Använd inte hela alphabounds för automatisk storleksberäkning. Manifestets contentBoundsAlpha32 används bara för mätning; rita hela originalbilden så inget kapas.
- Kontrast mot verklig terräng och synbarhet i normalzoom återstår att godkänna. preview.html visar enfärgade bakgrunder och är ingen ersättning för speltest.
- Bildens ljussättning roterar med figuren. Motorns eventuella markskugga ska bedömas separat.

## Återkoppling som behövs från speltestet

En bild i normalzoom på väg, gräs och mörk vegetation, samt en 4× jämförelse av båda sidorna i åtta riktningar. Visa redo och liggande med samma markerade pivot samt ett kort klipp av byte mellan dem. Redovisa särskilt om bredden 28/32 ger rätt skala och om vapnet följer riktningen. Märk läget GRAFIKPROV V2 – EJ GODKÄNT.

Claude äger spelmotor, terrängplacering, formationer och visning. Nästa grafiksteg är att korrigera dessa två grundfigurer efter spelprovet, därefter bygga specialistroller och riktiga gång-/krypsekvenser. Detta paket får inte rapporteras som färdiga squads eller färdig spelgrafik.

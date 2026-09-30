# Speltest: german-helmet-correction-v2

Datum: 2026-10-01 · Granskat av: Claude · Status: **EJ GODKÄNT.** Björn har inte provspelat.

## Så provas det

- `?art=pilot-h2&side=german` (eller `&side=soviet`) visar den nya versionen. Märket lyder "GRAFIKPROV V4 + TYSK HJÄLM 2 – EJ GODKÄNT".
- Lägg till `&helmet=v1` för **före**-bilderna (hjälmkorrigering 1). Märket lyder då "… TYSK HJÄLM 1 (FÖRE) …".
- Tidigare lägen (standard, v1, v2, v3, v4) finns kvar och laddar utan fel.

## Integration

- De tre tyska arken (gevärsskytt, gruppchef, MG-skytt) och manifestet är kopierade **oförändrade** till `dist/assets/prototype/german-helmet-v2/`. Skalan är 28 px per enhet i alla poser.
- På den tyska sidan används de nya bilderna för Schütze (K98k), Gruppenführer (MP) och MG-Schütze (MG34), i redo och liggande.
- Assistent-MG-Schütze, Munitionsträger och Stellvertreter visas fortfarande med v1-figurer. Utslagna gör det också.
- På den sovjetiska sidan används v4-gevärsskyttarna.
- Gång och kryp är spärrade. Spelreglerna är oförändrade och alla 41 tester går igenom.

**Obs om underlaget:** Paketet hänvisar till *hjälmkorrigering 1* och till gruppchef och MG-skytt i v4-stil. Inget av det har levererats till Claude separat.

- "Före"-bilderna är därför utplockade oförändrade ur leverantörens `preview.html`, där de är märkta "Före".
- De ritas med v2:s manifest, eftersom leverantören anger att pivot och hjälmcentrum är ärvda mellan versionerna. Mynningspunkterna kan avvika något för "före".
- Om hjälmkorrigering 1 och dess manifest finns som eget paket bör det skickas hit.

## Bedömning av bakre hjälmkanten (`1-fore-efter-narbild-10x.jpg`, överst före, nederst efter)

- **Den bakre kanten är tydligt mer kompakt i den nya versionen** på alla tre rollerna, i både redo och liggande.
- Hjälmkupan har behållit sin storlek, och den korta skärmen framtill syns fortfarande.
- Gruppchefens hjälm har ingen spetsig flik. Leverantörens andra redigering fungerade.
- Vid 4× och normalzoom går skillnaden knappt att se (`4-blandad-grupp-…`). Ändringen påverkar alltså främst förstorade vyer och porträtt, inte läsbarheten i strid.
- Hjälmformen läses som tysk stålhjälm och skiljer sig tydligt från den sovjetiska.

## Pivot, mynning och riktning (`2a-riktningar-efter-4x.jpg`)

- Alla tre rollerna följer riktningen i åtta riktningar, i redo och liggande.
- Axelpunkt och hjälmcentrum ligger stabilt.
- De omskattade mynningspunkterna hamnar vid mynningen för K98k, MP och MG34.
- MG34:s tvåbensstöd och kylmantel, och MP:ns magasin, syns i 4×.

## Grafikfel och kvarstående (att skicka till grafikproduktionen)

1. **Blandad grupp.** Assistent, ammunitionsbärare och ställföreträdare är fortfarande v1-figurer, klart större och med stora packningar (`4-…`, översta raden och vänster i mittraden). Nästa naturliga paket är dessa tre roller i v4-proportioner.
2. **MG-Schütze liggande.** Vapnet sticker cirka 21 enheter fram från axeln, mot cirka 18 för K98k. Det är rimligt för MG34 men gör figuren längst i gruppen. Det bör bedömas när formationen görs om.
3. **Kvar sedan tidigare:** gång, kryp och utslagen saknas. Alfakanterna är inte slutrensade, men inga rester syns i spelet.

## Integration och begränsningar (hos Claude)

1. **Formationen** passar fortfarande inte liggande figurer på cirka 40 enheter. En formation som vrids efter gruppens riktning är planerad (ROADMAP, fas B).
2. **Utslagna** visas med v1-figur.
3. **Inne i hus** ritas soldaterna stående medan spelreglerna räknar dem som liggande. Oförändrat.

## Filer

| Fil | Innehåll |
|---|---|
| `1-fore-efter-narbild-10x.jpg` | Före (övre halvan) och efter (nedre): Schütze, Gruppenführer och MG-Schütze, redo och liggande, 10× på gräs |
| `2a-riktningar-efter-4x.jpg`, `2b-riktningar-fore-4x.jpg` | 8 riktningar per roll och pose. Gult kors = axelpunkt, blå ring = hjälm, röd prick = mynning |
| `3-normalzoom-tysk-blandad.jpg` | Hela spelet i normalzoom, tysk sida, riktiga blandade grupper |
| `4-blandad-grupp-4x-vag-vegetation-gras.jpg` | Blandad tysk grupp 4× på väg, i mörk vegetation och liggande på gräs |

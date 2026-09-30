# Grafikprov V4 – proportioner

V4 ersätter bara gevärsskyttarnas ready/prone i ett nytt valbart provläge. Grupporganisation och specialistroller ändras inte. Behåll äldre grafiklägen. Ingen ny gång, krypning eller fallen ingår.

## Ny skalningsprincip

Alla fyra bilder använder samma pixelsPerUnit = 28. Kropp, hjälm och vapen ska inte skalas om separat när ställningen byts. Den gamla regeln att hela figuren inklusive gevär skulle fylla 28/32 spelenheter är borttagen. Liggande blir därför längre när benen syns; det är inte samma sak som att kroppen förstoras.

Detta är en gemensam provskala för de nya källbilderna, inte ett påstående om verkliga meter. Om hela infanteriet behöver bli större eller mindre i spelet, använd samma globala faktor för samtliga fyra poser. Ingen hjälmmatchad alternativskala ingår.

## Integration

Använd sourceRect i manifest.json. Pivot, muzzle och helmetCenter är relativa till utsnittet. Hela utsnittet ritas med padding. draw-soldier.js är medföljande referensadapter. Vinkel 0 är höger, positiv riktning medurs. Koordinater är manuellt uppskattade, särskilt axelmitten; de ska granskas i spelet.

Behåll liten kontaktskugga eller ingen skugga. Spritesen har ingen avsiktlig markskugga. Låt inte vapnets långa silhuett styra en stor skuggoval.

## Kontroll innan godkännande

Visa bara V4-grundfigurer i en separat jämförelse först, så v1-specialisternas storlek inte blandas ihop med V4-proportionerna. Visa därefter den riktiga blandade gruppen för integrationskontroll.

Kontrollera redo/liggande med fixerad axelpunkt, åtta riktningar och mynningsflamma. Jämför hjälmstorlek, faktisk gevärslängd och mynningsavstånd. De mått som följer med är uppskattningar från grafiken, inte oberoende speltestresultat.

Kontrollera normalzoom på väg, gräs och mörk vegetation, samt figurernas längd mot hus. Justera inte automatiskt ned liggande till 32 enheter: det skulle återinföra proportionsfelet. Bedöm formationernas avstånd separat.

V4 är ännu inte provspelad eller godkänd av Björn. Vapenmodellernas små detaljer, uniformer och alpha-kanter behöver fortfarande slutgranskas. Färdig grafik kräver även sammanhängande animationer och specialistroller.

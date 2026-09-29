# REQUEST_001 v1 – integration i Byn vid fronten

Leverans: 2026-09-29. Status: klar för integrationsgranskning, inte slutgodkänd i spelet.

## Börja här
Lägg paketet i art/incoming/REQUEST_001-v1/. Läs manifest.json och VALIDATION.md. Prova soldat, hus 0 och gruppkort bakom befintlig grafikväxling. Behåll fungerande grafik tills Björn har provspelat. Kopiera därefter godkända runtime-filer till projektets tillgångskatalog och dokumentera i docs/art/INTEGRATED.md. Concept-bilder, overview och dokument ska inte laddas som spelgrafik.

## Soldater
Båda SVG-filerna har viewBox -18 -12 48 24. Origo (0,0), riktning +x. width/height 192×96 är en förstorad visningsstorlek: använd viewBox-enheterna när figuren översätts till canvas. Vid rastercache är origo pixel (72,48) i en 192×96-rendering.

Välj exakt en grupp: ready, walk-a, walk-b, prone, crawl-a, crawl-b, fire eller fallen. ready är synlig som standard. Andra grupper har display:none som måste tas bort för valt tillstånd. Växla gång A/B och kryp A/B efter förflyttning, inte väggklocka; frys på paus. Figurerna är två ytterlägen, inte en färdig animation. Ingen garanti för direkt path-morfning: översätt delarna till canvas eller växla renderade ställningar.

Varje tillstånd har shadow, legs, torso, equipment, head och weapon i den ordningen. Lager identifieras med data-layer. XML-id är prefixade, exempelvis ready-head, för att inte upprepa samma id åtta gånger. Muzzle-flash finns i fire. Leader-mark finns per tillstånd och är avstängt. Prefixa även id med soldat/fil-id om flera hela SVG-dokument bäddas in i samma DOM.

Egen: oliv/khaki, rund hjälm och mjuk packning. Fiende: fältgrått, kantigare hjälm och annan packning. Inga nationella emblem. Fallen har separat gevär och 72 % opacitet; bevara detta. Ingen vald-grupp-ring ingår, den ritas av spelet.

## Hus 0
Båda PNG: 524×460 RGBA. Pixel (0,0) = värld (436,112); 4 pixlar/enhet. Rita båda med drawImage(image,436,112,131,115), inom samma världstransform som kartan. Skala inte efter synlig alfagräns.

Koordinater nedan är halvöppna pixelintervall, alltså höger/nedre gräns exkluderas:
- Footprint: x32–492, y32–428.
- Väggtjocklek: 24 px inåt.
- Nordfönster: x198–326, y32–56.
- Västfönster: x32–56, y166–294.
- Östfönster: x468–492, y166–294.
- Syddörr: x220–372, y404–428. Trappsten till y444.
- Takets opaka rektangel: x26–498, y26–434.

Fönstren är låga mörka karmar/springor, inte nya fullhöga väggar. Dörren visar sammanhängande golv. Söderfönstret ersätts av dörren enligt överlappet. Alla fem soldatplatser är fria från möbler. Endast en liten kista finns i nordväst.

Ritordning: kartbas → interiör → soldater/utrustning → tak → relevanta spelmarkeringar. När egen soldat går in, tona taket till cirka 0,15 över 0,25 sekunder. Låt interiören finnas under taket även under övergången. Lägg inte interiören ovanpå soldaterna.

Bildmaterialet är genererat och sedan skalat, klippt och maskat med kod efter exakta koordinater, enligt Björns uttryckliga godkännande. Geometrin ska inte ändras för att passa bilderna.

## Gruppkort
ui-squad-card-v1.html är fristående HTML/CSS med system-ui och sju referenstillstånd. För över kortmarkering och komponentregler till projektets komponent; sidans rubrik, exempelgrid, breddväljare och demonstrationsskript ska inte ingå i spelet.

Behåll .squad, .squad-top, .number, .count, .squad-bottom, .morale och .selected. Bind namn, styrka, order, plats, moral, ammunition och nedtryckt till riktig speldata. Synka aria-pressed med val och disabled med utslagen grupp.
- warn: moral 25–54 eller ammo under25 eller nedtryckt.
- critical: moral under25 eller reträtt; prioritet över warn.
- destroyed + disabled: utslagen; prioritet över övriga.
- selected och :focus-visible är oberoende av varningsnivå.
- demo-hover och demo-focus samt texten FOKUS är endast för referenssidan.

Varning har streckad vänsterkant och text. Allvarlig varning har dubbel kant och text. Utslagen har streckad ram och överstruket namn. Fokusringen ligger utanför kortet; lämna minst6px utrymme och undvik overflow:hidden i föräldern. Vid kombinerade selected/warn/critical behöver Claude behålla varningskantens färg och mönster; använd selected som separat inre markering om nuvarande CSS-kaskad konkurrerar.

Palettens levererade värden: --bg #151a17; --panel #202720; --line #394135; --text #e7e9da; --muted #a4ae9b; --accent #d7c28e; --green #a4bd83. Nya semantiska färger: --warning #dfb77e; --critical #e0a18b; --focus #f2e3b9. Scope:a till panelen vid integration så att andra vyer inte oavsiktligt ändras. ui-icons-v1.svg är en symbolbank med location, suppressed, ammo och morale, alla viewBox0 0 24 24/currentColor.

## Avvikelser och återstående bedömning
- Inga innerväggar har lagts till trots generellt önskemål om sådana: underlaget saknar motsvarande geometri. Lägg inte till visuella hinder utan spelstöd.
- Sydöstra takutbyggnaden är förenklad till ett rektangulärt sadeltak, vilket beställningen tillåter.
- Taket har tydliga raka ytterkanter och ingen separat slagskugga. Vid montage syns delar av den gamla målade byggnaden/skuggan utanför den nya geometrin. Claude behöver bedöma om kartbasen ska retuscheras i en nästa grafikbeställning. Ändra inte kollisionen för att dölja detta.
- Soldaternas stil är förenklad vektorgrafik med kraftig kontur för läsbarhet. Björn behöver godkänna stilskillnaden mot den målade kartan efter provspelning.
- UI-skärmbilden är tagen i webbläsaren och beskuren från tom marginal. HTML är den skarpa och skalbara originalleveransen.
- Inget är verifierat inne i Claudes spelbygge. Referensmontage visar placering, inte fungerande integration.

## Nästa kontroll hos Claude
Ta spelbilder i normalzoom på gräs, väg, åker och vegetation för båda sidor och ready/prone/fallen. Prova gång/kryp, eld, rotation och paus. Prova husets fem platser, dörrpassage och taktoning. Kontrollera att gamla karttaket inte syns störande utanför. Prova kortens sju lägen och kombinationerna vald+varning/fokus, även i gråskala. Återkom med skärmbilder och konkreta avvikelser innan fler tillgångar beställs.

## Ursprung
Soldater, ikoner och HTML/CSS är framtagna för projektet i denna leverans. Hustexturer är AI-genererade med den inbyggda bildtjänsten och bearbetade för passform. PROMPTS.md redovisar bildinstruktionerna. Kartbakgrunder i concept-bilder kommer från Björns bifogade referenspaket; deras ursprung/licens är inte oberoende verifierad. Inga externa köpta grafikpaket, typsnitt eller kopierade Close Combat-tillgångar har lagts till. Referensbilderna följer endast med som delar av granskningsmontage.


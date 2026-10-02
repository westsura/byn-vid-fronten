# Byn vid fronten – speldesign

Senast uppdaterad 2026-10-02. Källa: designdokumentet i claude.ai-projektet "Close Combat".

## Grundläge

Byn vid fronten är ett taktiskt infanterispel i webbläsaren, vy ovanifrån, med Close Combat som förebild och idéer från brädspelet Advanced Squad Leader (ASL). ASL används som inspiration för stridssystemet, inte som regelverk, och turordningen tas inte med.

| Ram | Beslut |
| --- | --- |
| Sida | Tysk. Allierad eller sovjetisk spelbar sida kan komma senare. |
| Krigsskådeplats | Östfronten, 1942–1945. Motståndare: sovjetiskt infanteri. |
| Prototypår | 1943 |
| Skala | En pluton. Spelaren ger order till enskilda grupper. |
| Tempo | Pausbar realtid |
| Operation | Morgonljus (fiktiv) |
| Miljö | Rysk eller ukrainsk by. Prototypkartan får vara vilken by som helst; kartor anpassas per scenario senare. |

## Styrkor och organisation

Spelarens styrka är en tysk skyttepluton (Schützenzug) byggd på faktisk organisation. All organisation beskrivs som data, inte hårdkodad, så att år, underbemanning och senare andra nationer bara kräver nya enhetsfiler.

**Plutonen**

- Plutonsledning (Zugtrupp): plutonchef, ställföreträdare eller Zugtruppführer, ordonnanser, bårbärare.
- Tre eller fyra skyttegrupper beroende på år. 1942: fyra grupper om tio man, ofta med lätt granatkastare. 1944: tre grupper om nio man, ingen granatkastare.
- Östfronten: förbanden var nästan alltid underbemannade. Scenarier kan ge en sliten pluton med flit.

**Gruppen**

- Gruppchef, ställföreträdare, kulsprutetrupp (skytt 1–3) och skyttar.
- Kulsprutan (MG34/MG42) är gruppens huvudvapen. Skyttarna anfaller med stöd av den eller skyddar och försörjer den.
- Gruppen är **delbar vid behov** i kulsprutetrupp och skyttetrupp. Gruppchefen följer ena delen, ställföreträdaren den andra. Odelad grupp är grundläget.
- Saknas underofficer leder ställföreträdaren, och gruppen kan då inte delas med ledare i båda delar.

**Motståndaren**

Sovjetiskt infanteri: större numerär, många kulsprutepistoler (PPSj) för närstrid, kulsprutan DP som gruppvapen. Kontrasten är medveten: färre och bättre ledda tyska grupper mot massa och närstridseldkraft.

## Tillståndsmodell

All stridsmekanik läser från tre värden per grupp eller trupp och en gemensam hotkarta. Detta byggs först, eftersom resten bygger på det.

| Värde | Tidsskala | Stiger av | Sjunker av | Påverkar |
| --- | --- | --- | --- | --- |
| Nedhållning | Sekunder | Eld mot eller nära gruppen | Snabbt när elden upphör | Rörlighet, eldeffekt, vilja att lyda |
| Sammanhållning | Minuter | Återsamling utom eld, ledare nära | Förluster, isolering, flankering, förlorad ledare | Förmåga att anfalla, risk att brytas |
| Eldberedskap | Sekunder | Stillastående i eldställning | Nollställs vid förflyttning, avbryts vid pipbyte | Träffsannolikhet och eldvolym |

**Hotkarta**: rutnät över vilka rutor som just nu bestryks och av vem. Den används för AI:ns vägval, för defensiv eld och för spelarens överblick. Uppdateras på rutnät och spritt över flera bildrutor.

**Obehag**: en ruta där soldater nyss beskjutits behåller ett separat obehagsvärde som gör soldater ovilliga att gå dit. Det påverkar beteende, inte faktisk risk.

Varje värde behöver tydlig visuell återkoppling, annars upplevs systemet som slumpmässigt.

## Eld och rörelse

Att skjuta och att förflytta sig ska vara ett verkligt val. En grupp som ligger still bygger upp eldberedskap; en grupp som flyttar tappar den och måste bygga upp den igen.

- Eldberedskap är en glidande skala, inte av/på.
- Riktvärden att balansera: gevärstrupp 3–4 s till full effekt, lätt kulspruta något längre, tung kulspruta på lavett 15–20 s.
- Delad grupp gör principen konkret: kulsprutetruppen ligger kvar som eldbas medan skyttetruppen avancerar.
- MG42-egenheter: hög eldhastighet, stor ammunitionsåtgång, pipbyte. Pipbyte ger en kort period med kraftigt sänkt eldkraft.
- Visuell återkoppling, till exempel en ring som fylls runt gruppen.

## Defensiv eld och bevakningssektorer

En förflyttningsväg ska kunna göras farlig genom att någon bestryker den. Zonen är farlig bara så länge någon faktiskt skjuter; ASL:s Residual Firepower överförs inte bokstavligt.

- **Bevakningssektor**: spelaren ritar en sektor för en grupp eller trupp.
- **Öppningsavstånd**: håll inne elden tills fienden är inom ett angivet avstånd.
- **Ytbekämpning**: beskjut ett område utan synligt mål. Kostar ammunition, låg träffsannolikhet, används främst för att hålla ner.
- **Målprioritering** (infanteri, vapengrupper, fordon) väntar tills fordon finns i spelet.
- När elden tystnar försvinner faran men obehaget dröjer kvar (se Tillståndsmodell).

## Brutna förband och återhämtning

En grupp kan sluta fungera som stridsenhet långt innan den är utslagen. Spelaren ska kunna vinna genom att bryta fiendens försvar, även när många fiender lever.

- Nedhållning släpper fort när elden upphör; gruppen lyfter huvudet igen.
- Låg sammanhållning gör att gruppen kan försvara sig men inte anfalla, och vid mycket låga värden bryts den och drar sig undan.
- Återhämtning kräver skydd från eld, helst en ledare och gärna en återsamlingsplats. Skyddade reträttvägar och reserver blir därmed viktiga.
- Segervillkor räknar **stridsdugliga** soldater, inte levande.

## Ledare

Ledare är en knapp resurs med en huvuduppgift åt gången. Beslutet spelaren ständigt ställs inför: var behövs min bästa ledare just nu?

**Plutonsnivå**: plutonchef och ställföreträdare (Zugtruppführer). Var och en väljer ett läge, med effekt inom en radie:

| Läge | Effekt |
| --- | --- |
| Led eld | Snabbare eldberedskap och bättre träff för grupper nära |
| Följ anfall | Högre sammanhållning och snabbare ordermottagning under förflyttning |
| Samla | Återställer sammanhållning hos brutna grupper utom eld |

**Gruppnivå**: gruppchef och ställföreträdare är inbyggda i gruppen, inte egna enheter. Stupar gruppchefen tappar gruppen sammanhållning och reagerar långsammare på order.

En plutonsledare som stupar ska märkas tydligt: färre som kan samla brutna grupper.

**Ledarnas egenskaper**

Ledare ska skilja sig i hur de används, inte bara i siffror. Varje ledare har tre värden och en egenskap.

- **Ledning**: radie och hur snabbt order verkställs.
- **Eldledning**: snabbare eldberedskap och bättre träff.
- **Samling**: hur snabbt sammanhållning återställs.

| Egenskap | Fördel | Nackdel |
| --- | --- | --- |
| Våghals (Draufgänger) | Snabbare anfall, bryts mindre lätt i anfall | Svår att dra tillbaka, större förluster |
| Försiktig | Håller ställning bättre | Långsam att avancera ur skydd |
| Östfrontsveteran | Bättre i bebyggelse och närstrid | Dyrare |
| Ung och oprövad | Billig | Svag samling, kan själv bli nedhållen |
| Kulsprutespecialist | Snabbare pipbyte och beredskap | Ingen nytta för skyttetruppen |
| Eldledare | Kan kalla in artilleri utan observatör | Kräver siktlinje och att stå still |

**Synlighet**: ledarkort i köpskärmen (grad, namn, värden som staplar, egenskap med en rad förklaring); namn och egenskapsikon på gruppkortet i panelen; markerad ledare visar sin radie; händelser namnger ledaren ("Feldwebel Krause samlar gruppen").

Stupar en ledare tar ställföreträdaren över med svagare värden och utan egenskap.

## Order och kontroll

Spelet körs i pausbar realtid med order till enskilda grupper eller trupper.

- **Aktiv paus**: allt fryser; spelaren granskar läget, ger order, sätter sektorer och ledarlägen.
- **Halv hastighet** som komplement för intensiva ögonblick.
- **Grundorder**: förflytta, förflytta snabbt, kryp, försvara/bevaka sektor, skjut mot mål, ytbekämpa, dela/slå ihop grupp, dra dig tillbaka.
- Ledarlägen sätts per ledare, inte per sekund. Tre fasta zoomnivåer: hela kartan, pluton, grupp.

**Enhetspanel utanför kartan**

- Ett kort per enhet i plutonens ordning: plutonsledning, grupperna, förstärkningar.
- Kortet visar namn, antal stridsdugliga, ledare, tillstånd (nedhållen, bruten) och eldberedskap.
- Dela-knapp på gruppkortet. Delad grupp visas som två halvkort (kulsprutetrupp, skyttetrupp) som väljs var för sig eller tillsammans, plus en slå ihop-knapp.

**Val och kamera**

- Ett klick i panelen markerar enheten; kameran står still.
- Dubbelklick centrerar kameran med en snabb glidning, inte ett hopp.
- Zoomnivån ändras bara när spelaren själv byter nivå. Att testa i prototypen: dubbelklick på kartnivå går ner till plutonsnivå.
- Snabbtangenter 1–5 för grupperna: en tryckning markerar, två centrerar.
- Klick på kantmarkering vid stridskontakt centrerar kameran.

## Styrkeuppbyggnad med poäng

Likt Close Combat sätter spelaren ihop sin styrka före scenariot. Scenariot anger en fast kärna och en poängbudget för förstärkningar.

- **Fast kärna**: plutonsledning plus de grupper scenariot anger, eventuellt underbemannade.
- **Köpbara förstärkningar** (ur kompani eller bataljon): extra skyttegrupp, tung kulsprutegrupp, granatkastargrupp 8 cm, pionjärgrupp, prickskytt, inkallad artillerield (eldöverfall), senare pansarvärn.
- **Tillgänglighet per år**: varje enhet har en giltighetsperiod.
- **Kvalitet kostar**: en duglig gruppchef eller veterangrupp kostar mer. Valet blir fler mannar eller bättre ledda mannar.
- Svårighetsgraden bärs av scenariots uppgift, terräng och motståndare, inte av budgeten.

## Scenarier och segervillkor

Scenarier ger samma stridssystem olika taktiska problem. Varje scenario definierar år, karta, kärna, budget, motståndare, uppgift och segervillkor.

| Scenariotyp | Uppgift | Segervillkor (exempel) |
| --- | --- | --- |
| Fördröjning | Håll byn en viss tid, dra sedan ur huvuddelen | Tid hållen + andel stridsdugliga som når uttagspunkt |
| Motanfall | Ta tillbaka en byggnad | Stridsdugliga soldater i byggnaden vid slut |
| Hålla med för få | Försvara en stödjepunkt med sliten pluton | Stödjepunkt hållen vid slut |
| Slå ut pjäs | Slå ut en sovjetisk kanon innan förstärkning anländer | Pjäs utslagen före given tid |

Konvojscenarier väntar tills fordon finns i spelet.

## Kampanj och förluster

Scenarierna länkas: ledare och gruppernas förluster förs vidare, och poäng används för att ersätta förluster.

- **Scenario 1**: spelaren väljer alla ledare bland kandidater mot poäng.
- **Efter varje scenario** får varje ledare och soldat ett utfall: oskadd, lätt skadad (tillbaka efter ett scenario), svårt skadad (borta resten av kampanjen) eller stupad.
- **Följande scenarier**: överlevande följer med. Luckor fylls genom befordran inifrån (gratis, svagare), ersättare mot poäng eller tillfrisknade som återvänder.
- **Gruppernas förluster** kvarstår. Soldater ersätts mot poäng.
- **Erfarenhet**: överlevande ledare kan förbättra ett värde.
- Datamodellen skiljer från början på ledaren eller soldaten som person och gruppen han tillhör, så att kampanjen kan läggas till utan omskrivning. Prototypen omfattar bara scenario 1.

**Balans och realism**

- **Ersättare är gröna**: en grupp med många nya män får något lägre sammanhållning tills den överlevt en strid tillsammans. Veteraner blir värda att bevara.
- **Sammanslagning** av decimerade grupper är gratis: två grupper om fyra kan bli en om åtta, på bekostnad av antalet grupper.
- **Minsta styrka och förlustmedveten budget** per scenario, så att en dålig första strid inte låser kampanjen.

## Prototypens avgränsning

Prototypen är en pluton mot en sovjetisk motståndare i en by, år 1943, med en scenariotyp. Den byggs i steg med avstämning och skärmbildskontroll efter varje steg.

1. Enhetsdata: tysk pluton 1943 och sovjetisk motståndare som datafiler. **Avstämning.**
2. Tillståndsmodell och hotkarta, med enkel visuell återkoppling. **Avstämning.**
3. Eld och rörelse med eldberedskap, inklusive delbar grupp, plus grundeffekter: nedslag efter material, spårljus, statusmarkering, kamerastöt för granater och kantmarkering vid kontakt utanför bild. **Avstämning.**
4. Aktiv paus, halv hastighet och grundorder. **Avstämning.**
5. Bevakningssektorer och öppningsavstånd. **Avstämning.**
6. Ledarlägen på plutonsnivå. **Avstämning.**
7. Köpskärm: fast kärna, budget och tre förstärkningar (extra grupp, tung kulspruta, granatkastare). **Avstämning.**
8. Ett scenario (förslag: motanfall mot en byggnad) med segervillkor på stridsdugliga. **Avstämning.**

Utanför prototypen: fordon, kampanj, multiplayer, spelbar sovjetisk eller allierad sida, ytbekämpning, pipbyte och inkallat artilleri (kan läggas till efter steg 5).

## Grafik och effekter

Effekterna ska förmedla soldaternas utsatthet och vapnens tyngd, och dra uppmärksamheten till grupper i stridskontakt, utan att kartan blir svårläst. Den grafiska riktningen görs om för östfronten: trähus (izbor), raviner, kolchosbyggnader och någon stenbyggnad som stödjepunkt.

**Principer**

1. Gevär och kulsprutor påverkar främst platsen där elden träffar.
2. Explosioner får påverka kameran, proportionellt mot styrka och avstånd.
3. Taktiska konsekvenser är alltid tydligare än dekorativa effekter.
4. Gränssnittet ligger stilla när spelvärlden skakar.
5. Effekter följer dold information: en explosion utanför spelarens kännedom avslöjar inte sin position via kameran, och spårljus från oupptäckt skytt visar riktning, inte position.
6. Inget hit stop i realtid. Inzoomningar bara som mycket liten puls vid kraftiga explosioner på gruppnivå; större inzoomningar hör till repris eller följekamera.

**Händelser**

| Händelse | Effekt | Förmedlar |
| --- | --- | --- |
| Enstaka gevärsskott | Kort mynningsflamma, torrt ljud, litet nedslag | Eldgivning utan att störa överblicken |
| Kulspruteeld mot grupp | Spårljus, återkommande nedslag, splitter, soldater trycker sig ned | Gruppen är utsatt och får svårt att agera |
| Granat i närheten | Kort, skarp kamerastöt följd av damm | Plötslig, farlig smäll |
| Artilleri (inkallat) | Vinande ljud före nedslag, djupare och långsammare avklingande skakning | Tyngd och upprepade tryckvågor |
| Pansarvärnsträff | Mycket kort visuell betoning, sedan rök och synlig reaktion på fordonet | Träffen är viktig; utfallet går att avläsa |
| Grupp nedhållen eller flyr | Ändrad kroppsställning, röster, tydlig statusmarkering | Den taktiska konsekvensen |

Händelseförloppet ska vara läsbart: eld avges, nedslag, gruppen reagerar, resultatet visas.

**Nedslag efter material**: träflisor från trähus, tegeldamm från sten, jordstänk i öppen terräng. Effekten speglar skyddsvärdet, så att spelaren lär sig terrängen genom att titta.

**Artilleri** visas inte som pjäser på kartan. Det kallas in: observatör med siktlinje, fördröjning från begäran till nedslag, möjlig inskjutning som hamnar fel. Kan köpas i poängsystemet.

**Zoomnivåer**

| Nivå | Kamera | Effekter |
| --- | --- | --- |
| Hela kartan | Stilla | Ljud, rök, damm, statusmarkeringar |
| Pluton | Små stötar vid närliggande explosioner | Tydligare nedslag och spårljus |
| Grupp | Kraftigare stötar, starkare ljud | Full intensitet |

**Kameraskakning**: ett ackumulerat traumavärde byggs upp av explosioner och klingar av; skakningen följer traumat i kvadrat och har ett tak. Reglage för skakstyrka och för blixtar (tillgänglighet).

**Stridskontakt utanför bild** (bara egna enheter): riktat ljud, markering i skärmkanten mot gruppen, rad i händelselogg och valfri autopaus vid kontakt.

**Grafikkostnad**: börja med statusmarkering och ett enda nere-läge per soldat; fler poser senare via GPT:s grafikflöde.

## Öppna frågor och senare utbyggnad

- [ ] Bekräfta två ledare på plutonsnivå (plutonchef + ställföreträdare) eller en.
- [ ] Grundsituation i första scenariot: anfall, försvar eller båda.

Senare: fordon och pansarvärn, målprioritering, konvojscenarier, spelbar sovjetisk eller allierad sida, multiplayer.

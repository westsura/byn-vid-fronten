# Byn vid fronten – speldesign

Senast uppdaterad 2026-10-02 (inklusive Björns beslut efter steg 0). Källa: designdokumentet i claude.ai-projektet "Close Combat".

## Grundläge

Byn vid fronten är ett taktiskt infanterispel i webbläsaren, vy ovanifrån, med Close Combat som förebild och idéer från brädspelet Advanced Squad Leader (ASL). ASL används som inspiration för stridssystemet, inte som regelverk, och turordningen tas inte med. Spelet ska vara historiskt realistiskt.

| Ram | Beslut |
| --- | --- |
| Sida | Tysk. Allierad eller sovjetisk spelbar sida kan komma senare. |
| Krigsskådeplats | Östfronten, 1942–1945. Motståndare: sovjetiskt infanteri. |
| Prototypår | 1943 |
| Skala | En pluton. Spelaren ger order till enskilda grupper. |
| Tempo | Pausbar realtid |
| Operation | Morgonljus (fiktiv) |
| Miljö | Rysk eller ukrainsk by. Prototypkartan får vara vilken by som helst; kartor anpassas per scenario senare. |
| Språk | Gränssnittet på engelska. Tyska termer för tyska förband, befattningar, grader och utmärkelser; rysk translitterering för sovjetiska (se Språk i gränssnittet). |
| Historisk trohet | Uniformer, gradbeteckningar, utmärkelser och symboler visas historiskt korrekt (se Symboler). |

## Språk i gränssnittet

Allt i gränssnittet är på engelska, utom förband, befattningar, grader och utmärkelser, som står på originalspråket med historiskt korrekta namn och förkortningar: tyska för tyska styrkor, rysk translitterering (latinska bokstäver) för sovjetiska. Det ger tidskänsla utan att göra spelet svårt att förstå.

| Kategori | Språk | Exempel |
| --- | --- | --- |
| Tyska förband | Tyska | Zug, Zugtrupp, 2. Gruppe, MG-Trupp, Schützentrupp, schwere MG-Gruppe, Granatwerfergruppe, Pioniergruppe, Scharfschütze |
| Tyska befattningar | Tyska | Zugführer, Zugtruppführer, Gruppenführer, Truppführer, MG-Schütze 1, Melder, Krankenträger |
| Tyska grader | Tyska, med förkortning | Feldwebel (Fw.), Unteroffizier (Uffz.), SS-Unterscharführer (SS-Uscha.) |
| Tyska utmärkelser | Tyska | Eisernes Kreuz 2. Klasse, Infanterie-Sturmabzeichen, Verwundetenabzeichen |
| Sovjetiska förband, befattningar, grader, utmärkelser | Rysk translitterering | Strelkovyy vzvod, 2-ye otdeleniye, Komandir otdeleniya, Serzhant, Medal "Za otvagu" |
| Menyer, order, tillstånd, värden, egenskaper, hjälptexter | Engelska | Move, Fast Move, Crawl, Defend, Pinned, Broken, Leadership, Fire Control, Rally |
| Händelselogg | Engelska med originalnamn och grader | "Fw. Krause rallies 2. Gruppe", "Uffz. Bauer awarded Eisernes Kreuz 2. Klasse", "Enemy otdeleniye pinned" |

Befattningen Gruppenführer används för både Heer och Waffen-SS. SS-graden Gruppenführer (en generalsgrad) förekommer aldrig i spelet, och grader visas alltid med SS-prefix, så förväxling uppstår inte.

Translitterering följer en enkel, konsekvent engelsk standard (t.ex. "yy", "ye", "zh", "kh", "ts", "ch", "sh", "shch"), utan diakritiska tecken.

## Styrkor och organisation

Spelarens styrka är en tysk skyttepluton (Schützenzug) byggd på faktisk organisation. All organisation beskrivs som data, inte hårdkodad, så att år, underbemanning och senare andra nationer bara kräver nya enhetsfiler.

**Plutonen**

- Plutonsledning (Zugtrupp): plutonchef, ställföreträdare eller Zugtruppführer, ordonnanser, bårbärare.
- Tre eller fyra skyttegrupper beroende på år. 1942: fyra grupper om tio man, ofta med lätt granatkastare. 1943 (prototypen): tre grupper om tio man; scenarier kan underbemanna. 1944: tre grupper om nio man, ingen granatkastare.
- Östfronten: förbanden var nästan alltid underbemannade. Scenarier kan ge en sliten pluton med flit.

**Gruppen**

- Gruppchef, ställföreträdare, kulsprutetrupp (skytt 1–3) och skyttar.
- Kulsprutan (MG34/MG42) är gruppens huvudvapen; prototypen använder MG34. Skyttarna anfaller med stöd av den eller skyddar och försörjer den.
- Gruppen är **delbar vid behov** i kulsprutetrupp och skyttetrupp. Gruppchefen följer ena delen, ställföreträdaren den andra. Odelad grupp är grundläget.
- Saknas underofficer leder ställföreträdaren, och gruppen kan då inte delas med ledare i båda delar.

**Motståndaren**

Sovjetiskt infanteri: större numerär, många kulsprutepistoler (PPSj) för närstrid, kulsprutan DP som gruppvapen. Kontrasten är medveten: färre och bättre ledda tyska grupper mot massa och närstridseldkraft. Grader och benämningar, se Röda armén – förband, befattningar och grader.

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

| Läge (i gränssnittet) | Effekt |
| --- | --- |
| Direct Fire | Snabbare eldberedskap och bättre träff för grupper nära |
| Lead Assault | Högre sammanhållning och snabbare ordermottagning under förflyttning |
| Rally | Återställer sammanhållning hos brutna grupper utom eld |

**Gruppnivå**: gruppchef och ställföreträdare är inbyggda i gruppen, inte egna enheter. Stupar gruppchefen tappar gruppen sammanhållning och reagerar långsammare på order.

En plutonsledare som stupar ska märkas tydligt: färre som kan samla brutna grupper.

**Ledarnas egenskaper**

Ledare ska skilja sig i hur de används, inte bara i siffror. Varje ledare har tre värden och en egenskap.

- **Leadership**: radie och hur snabbt order verkställs.
- **Fire Control**: snabbare eldberedskap och bättre träff.
- **Rally**: hur snabbt sammanhållning återställs.

| Egenskap (i gränssnittet) | Fördel | Nackdel |
| --- | --- | --- |
| Daredevil | Snabbare anfall, bryts mindre lätt i anfall | Svår att dra tillbaka, större förluster |
| Cautious | Håller ställning bättre | Långsam att avancera ur skydd |
| Eastern Front Veteran | Bättre i bebyggelse och närstrid | Dyrare |
| Green | Billig | Svag samling, kan själv bli nedhållen |
| MG Specialist | Snabbare pipbyte och beredskap | Ingen nytta för skyttetruppen |
| Forward Observer | Kan kalla in artilleri utan observatör | Kräver siktlinje och att stå still |

**Synlighet**: ledarkortet i köpskärmen (se nedan); kompakt version på gruppkortet i panelen; markerad ledare visar sin radie; händelser namnger ledaren med grad ("Fw. Krause rallies 2. Gruppe").

Stupar en ledare tar ställföreträdaren över med svagare värden och utan egenskap.

### Ledarkort

Kortet ska på några sekunder svara på vad ledaren gör för gruppen, och samtidigt ge känslan av en person. Exemplet visar språkregeln: tyska för befattning, förband, grad och utmärkelser, engelska för resten.

```
┌───────────────────────────────────┐
│ GRUPPENFÜHRER · 2. Gruppe   45 pts│
│ ┌────────┐ Feldwebel  [axelklaff] │
│ │porträtt│ Hans Krause            │
│ └────────┘ Age 31 · In the field since 1941│
│            EK II · ISA · VwA      │
├───────────────────────────────────┤
│ Leadership    ■■■■□               │
│ Fire Control  ■■□□□               │
│ Rally         ■■■■■               │
├───────────────────────────────────┤
│ ⚑ Eastern Front Veteran          │
│ + Better in buildings and close combat│
│ − Costs more                      │
├───────────────────────────────────┤
│ Suited for: holding, house fighting│
└───────────────────────────────────┘
```

- **Huvud**: befattning, förband och pris i poäng.
- **Person**: grad i klartext med gradbeteckning som liten bild (axelklaff, ärmvinkel eller kragspegel enligt tabellerna nedan), namn och en rad bakgrund (ålder, i fält sedan, ursprung). Bakgrunden ska förklara egenskapen.
- **Porträtt** eller siluett med gradbeteckning (se Öppna frågor). Porträtt visar uniform med korrekta emblem och utmärkelser.
- **Utmärkelser** som små ikoner med fullt tyskt namn vid hovring, återgivna historiskt korrekt. Ordnade enligt bärordning: EK I, Deutsches Kreuz, Sturmabzeichen, Verwundetenabzeichen, Nahkampfspange, band för EK II och Ostmedaille.
- **Tre värden som fem rutor**, inga siffror.
- **Egenskapen**: ikon, namn, en rad fördel och en rad nackdel i olika färg.
- **Suited for-rad**: kort sammanfattning härledd ur värden och egenskap.
- **Jämförelse**: vid hovring över en kandidat visas skillnaden mot nuvarande val på staplarna (grön/röd ruta) och poängskillnaden i huvudet.
- **Kampanj** (senare): rad med antal strider, skadestatus och erfarenhetsökningar. Dold i scenario 1.
- **Kompakt version** på gruppkortet i spelet: gradförkortning, efternamn, egenskapsikon ("Fw. Krause ⚑"). Hela kortet vid hovring.
- **Undviks**: råa siffror, flera egenskaper, långa biografier.

## Grader, gradbeteckningar och utmärkelser

Grader, beteckningar och utmärkelser ska vara historiskt trogna. Data ligger per formation (Heer, Waffen-SS, Röda armén), så att samma ledarkort och logik fungerar för alla.

Från hösten 1942 döptes Heerens infanteriregementen om till Grenadier-Regimenter; meniga heter därför **Grenadier** i scenarier från 1943, men **Schütze** 1942.

### Heer – befattningar och grader

| Befattning | Föreskriven grad | Vanligt i praktiken |
| --- | --- | --- |
| Zugführer (plutonchef) | Leutnant | Feldwebel eller Oberfeldwebel; ofta hade bara en pluton per kompani officer |
| Zugtruppführer (ställföreträdare, plutonsledning) | Unteroffizier | Unteroffizier–Feldwebel |
| Gruppenführer (gruppchef) | Unteroffizier | Obergefreiter eller Unterfeldwebel |
| Stv. Gruppenführer / Truppführer | Gefreiter–Obergefreiter | Gefreiter |
| MG-Schütze 1 | Gefreiter | Obergefreiter |
| Skyttar, MG-skytt 2–3, Melder | Grenadier / Obergrenadier | Samma |

Graden styr kandidatpriset: en Leutnant som Zugführer är dyr och ovanlig, en Oberfeldwebel det vanliga; en Obergefreiter som Gruppenführer är billig och ett tecken på slitna förband.

### Heer – gradbeteckningar (fältuniform, infanteri, vit vapenfärg)

| Grad | Förkortning | Beteckning |
| --- | --- | --- |
| Grenadier (1942: Schütze) | Gren. / Schtz. | Slät axelklaff |
| Obergrenadier (1942: Oberschütze) | Ogren. / Oschtz. | Rund ärmbricka med stjärna, vänster överarm |
| Gefreiter | Gefr. | En vinkel, vänster överarm |
| Obergefreiter | Ogefr. | Två vinklar |
| Stabsgefreiter | Stgefr. | Två vinklar med stjärna |
| Unteroffizier | Uffz. | Silvertress på kragen och runt axelklaffen, öppen nertill |
| Unterfeldwebel | Ufw. | Tress helt runt axelklaffen |
| Feldwebel | Fw. | Hel tress plus en stjärna |
| Oberfeldwebel | Ofw. | Hel tress plus två stjärnor |
| Stabsfeldwebel | Stfw. | Hel tress plus tre stjärnor |
| Leutnant | Lt. | Officersaxelklaff av flätad silversnodd, ingen stjärna |
| Oberleutnant | Oblt. | Officersaxelklaff med en stjärna |
| Hauptmann | Hptm. | Officersaxelklaff med två stjärnor |

Övriga uniformsemblem Heer: örn (Hoheitsabzeichen) på höger bröst, kragspeglar (Litzen) på kragen.

### Waffen-SS – befattningar och grader

| Befattning | Föreskriven grad | Vanligt i praktiken |
| --- | --- | --- |
| Zugführer | SS-Untersturmführer | SS-Oberscharführer eller SS-Hauptscharführer |
| Zugtruppführer | SS-Unterscharführer | SS-Unterscharführer–SS-Oberscharführer |
| Gruppenführer (befattning) | SS-Unterscharführer | SS-Rottenführer eller SS-Scharführer |
| Stv. Gruppenführer / Truppführer | SS-Sturmmann–SS-Rottenführer | SS-Sturmmann |
| MG-Schütze 1 | SS-Sturmmann | SS-Rottenführer |
| Skyttar, MG-skytt 2–3, Melder | SS-Schütze / SS-Grenadier | Samma |

### Waffen-SS – gradbeteckningar

Waffen-SS bar axelklaffar av Heer-modell (samma tress- och stjärnsystem som motsvarande Heer-grad, på svart underlag med vapenfärg) och därtill gradbeteckning på vänster kragspegel. Ärmvinklar för meniga som i Heer. Höger kragspegel bar SS-runorna, och örnen bars på vänster överarm.

| Grad | Heer-motsvarighet | Förkortning | Vänster kragspegel / ärm |
| --- | --- | --- | --- |
| SS-Schütze / SS-Grenadier | Grenadier | SS-Schtz. / SS-Gren. | Slät |
| SS-Oberschütze / SS-Obergrenadier | Obergrenadier | SS-Oschtz. / SS-Ogren. | Slät; rund ärmbricka med stjärna |
| SS-Sturmmann | Gefreiter | SS-Strm. | En silverrand; en ärmvinkel |
| SS-Rottenführer | Obergefreiter | SS-Rttf. | Två silverränder; två ärmvinklar |
| SS-Unterscharführer | Unteroffizier | SS-Uscha. | En stjärna; tress på kragen |
| SS-Scharführer | Unterfeldwebel | SS-Scha. | En stjärna och en rand |
| SS-Oberscharführer | Feldwebel | SS-Oscha. | Två stjärnor |
| SS-Hauptscharführer | Oberfeldwebel | SS-Hscha. | Två stjärnor och en rand |
| SS-Sturmscharführer | Stabsfeldwebel | SS-Stuscha. | Två stjärnor och två ränder |
| SS-Untersturmführer | Leutnant | SS-Ustuf. | Tre stjärnor |
| SS-Obersturmführer | Oberleutnant | SS-Ostuf. | Tre stjärnor och en rand |
| SS-Hauptsturmführer | Hauptmann | SS-Hstuf. | Tre stjärnor och två ränder |

### Utmärkelser (Heer och Waffen-SS, östfronten 1942–45)

Samma militära utmärkelser tilldelades båda formationerna. Namn och förkortningar visas på tyska i gränssnittet.

| Utmärkelse | Förkortning | Krav | Hur den syns |
| --- | --- | --- | --- |
| Eisernes Kreuz 2. Klasse | EK II | Tapperhet; mycket vanlig bland veteraner | Band i knapphålet |
| Eisernes Kreuz 1. Klasse | EK I | Upprepad tapperhet | Kors på vänster bröstficka |
| Deutsches Kreuz in Gold | DKiG | Mellan EK I och Riddarkorset (från 1941) | Stor stjärna på höger bröst |
| Infanterie-Sturmabzeichen (silver) | ISA | Tre anfall på olika dagar | Märke på vänster bröst |
| Allgemeines Sturmabzeichen | ASA | Som stormärket, för pionjärer | Märke på vänster bröst |
| Verwundetenabzeichen | VwA | Svart 1–2 sår, silver 3–4, guld 5+ | Märke på vänster bröst |
| Nahkampfspange | NKS | 15/30/50 närstridsdagar, brons/silver/guld (från slutet av 1942) | Spänne ovanför vänster bröstficka |
| Medaille Winterschlacht im Osten 1941/42 | Ostmedaille | Tjänst på östfronten vintern 1941–42 | Band i knapphålet |
| Panzervernichtungsabzeichen | PVA | Slagit ut stridsvagn i närstrid (från 1942) | Ärmband, höger överarm |
| Ritterkreuz des Eisernen Kreuzes | RK | Ytterst sällsynt på plutonsnivå | Kors vid halsen |

**Regler i spelet**

- Utmärkelser är berättelse, inte bonusar. De förklarar egenskaperna (Eastern Front Veteran har Ostmedaille och ISA, Green har inget) men ger inga egna effekter.
- Ritterkreuz förekommer inte bland kandidater; högst som sällsynt kampanjhändelse.
- I kampanjen delas utmärkelser ut av händelser: sår ger Verwundetenabzeichen automatiskt, tredje anfallet ger Infanterie-Sturmabzeichen, närstridsdagar räknas mot Nahkampfspange, en ledare som håller ihop en grupp under svår eld kan få EK II. Resultatskärmen visar tilldelningar ("Uffz. Krause awarded Eisernes Kreuz 2. Klasse").
- Datamodell: person har formation, grad (namn + förkortning + beteckningsbild) och lista med utmärkelser (typ, grad/klass, datum, anledning).

### Röda armén – förband, befattningar och grader

Sovjetiska benämningar visas i rysk translitterering. I januari 1943 infördes axelklaffar (pogony) i Röda armén; dessförinnan bars gradbeteckning på kragspeglar. Scenarier 1942 visar därför kragspeglar, scenarier från 1943 axelklaffar.

**Förband och befattningar**

| Benämning | Betydelse |
| --- | --- |
| Strelkovaya rota | Skyttekompani |
| Strelkovyy vzvod | Skyttepluton |
| Strelkovoye otdeleniye (1-ye, 2-ye … otdeleniye) | Skyttegrupp |
| Komandir vzvoda | Plutonchef |
| Pomkomvzvoda | Ställföreträdande plutonchef |
| Komandir otdeleniya | Gruppchef |
| Pulemyotchik / Vtoroy nomer | Kulspruteskytt (DP) / laddare |
| Avtomatchik | Skytt med kulsprutepistol (PPSh) |
| Strelok | Gevärsskytt |

**Befattningar och grader**

| Befattning | Vanlig grad |
| --- | --- |
| Komandir vzvoda | Leytenant eller Mladshiy leytenant |
| Pomkomvzvoda | Starshiy serzhant |
| Komandir otdeleniya | Serzhant eller Mladshiy serzhant |
| Pulemyotchik | Yefreytor eller Krasnoarmeyets |
| Strelok, Avtomatchik | Krasnoarmeyets |

**Grader och beteckningar (infanteri, hallonröd vapenfärg)**

| Grad | Från 1943: axelklaff (pogon) | 1942: kragspegel |
| --- | --- | --- |
| Krasnoarmeyets | Slät | Slät |
| Yefreytor | En smal tvärrand | Slät med kantband |
| Mladshiy serzhant | Två smala tvärränder | Två trianglar |
| Serzhant | Tre smala tvärränder | Tre trianglar |
| Starshiy serzhant | En bred tvärrand | Fyra trianglar |
| Starshina | Bred längsgående galon | Fem trianglar |
| Mladshiy leytenant | En stjärna, ett längsgående streck | En kvadrat |
| Leytenant | Två stjärnor | Två kvadrater |
| Starshiy leytenant | Tre stjärnor | Tre kvadrater |
| Kapitan | Fyra stjärnor | En rektangel |

**Utmärkelser (för sovjetiska ledare, om spelbar sida eller fångade/stupade identifieras)**

| Utmärkelse | Kommentar |
| --- | --- |
| Medal "Za otvagu" | För tapperhet; vanlig bland meniga och underbefäl |
| Medal "Za boyevye zaslugi" | För stridsförtjänster |
| Orden Krasnoy Zvezdy | Röda stjärnans orden |
| Orden Otechestvennoy voyny | Fosterländska krigets orden (från 1942) |
| Orden Slavy | Ärans orden, för meniga och underbefäl (från slutet av 1943) |

Sovjetiska grader och utmärkelser behövs i prototypen främst för fiendens benämningar och för en framtida spelbar sovjetisk sida.

### Symboler

Spelet är realistiskt: uniformer, utmärkelser och utrustning visas historiskt korrekt, inklusive hakkors, SS-runor och örnemblem.

- Heer: örnen på höger bröst och på mössa/hjälm där den bars.
- Waffen-SS: SS-runorna på höger kragspegel, örnen på vänster överarm.
- Utmärkelser återges som de såg ut, t.ex. hakkorset i mitten av Eisernes Kreuz 1939.
- Röda armén: röd stjärna, hammare och skära på mössa, hjälm och utmärkelser där de bars.
- Symbolerna förekommer bara i historisk kontext på uniformer, utmärkelser och utrustning, inte som dekor i menyer, logotyp eller marknadsföring.
- Tekniskt ligger symbolerna som separata grafiktillgångar, så att en variant utan dem kan byggas om spelet ska distribueras där reglerna kräver det. I Tyskland gäller § 86a StGB; spel kan där tillåtas efter prövning av USK.

## Order och kontroll

Spelet körs i pausbar realtid med order till enskilda grupper eller trupper.

- **Aktiv paus**: allt fryser; spelaren granskar läget, ger order, sätter sektorer och ledarlägen.
- **Halv hastighet** som komplement för intensiva ögonblick.
- **Grundorder** (i gränssnittet): Move, Fast Move, Crawl, Defend/Cover Sector, Fire, Area Fire, Split/Merge, Retreat.
- Ledarlägen sätts per ledare, inte per sekund. Tre fasta zoomnivåer: hela kartan, pluton, grupp.

**Enhetspanel utanför kartan**

- Ett kort per enhet i plutonens ordning: Zugtrupp, grupperna, förstärkningar.
- Kortet visar förbandsnamn, antal stridsdugliga, ledare, tillstånd (Pinned, Broken) och eldberedskap.
- Split-knapp på gruppkortet. Delad grupp visas som två halvkort (MG-Trupp, Schützentrupp) som väljs var för sig eller tillsammans, plus en Merge-knapp.

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
- **Erfarenhet**: överlevande ledare kan förbättra ett värde och tilldelas utmärkelser (se Grader, gradbeteckningar och utmärkelser).
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

Pipbyte ingår i prototypen (steg 3).

Utanför prototypen: fordon, kampanj, multiplayer, spelbar sovjetisk eller allierad sida, ytbekämpning och inkallat artilleri (kan läggas till efter steg 5).

## Grafik och effekter

Effekterna ska förmedla soldaternas utsatthet och vapnens tyngd, och dra uppmärksamheten till grupper i stridskontakt, utan att kartan blir svårläst. Den grafiska riktningen görs om för östfronten: trähus (izbor), raviner, kolchosbyggnader och någon stenbyggnad som stödjepunkt. Uniformer och utrustning ska vara historiskt korrekta (se Symboler).

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

- [x] Två ledare på plutonsnivå: Zugführer och Zugtruppführer (beslut 2026-10-02).
- [ ] Grundsituation i första scenariot: anfall, försvar eller båda.
- [ ] Ledarkort: porträtt redan i prototypen, eller siluett med gradbeteckning tills vidare.
- [ ] Waffen-SS: spelbar formation i egna scenarier, och om dess organisation ska avvika från Heer i datafilerna.

Senare: fordon och pansarvärn, målprioritering, konvojscenarier, spelbar sovjetisk eller allierad sida, multiplayer.

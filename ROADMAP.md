# Roadmap – Byn vid fronten

Status per fas. **Klart** betyder implementerat och verifierat (automatiskt test och/eller provspelning i webbläsare). Publicerat = på https://byn-vid-fronten.vercel.app (varje push till `main`).

## Infrastruktur

- [x] Git-repo `westsura/byn-vid-fronten`, Vercel-projekt med automatisk publicering.
- [x] Koden uppdelad i läsbara ES-moduler utan byggsteg (`dist/src/`). Beteendet verifierat bit-identiskt mot den tidigare koden.
- [x] Tester med `node:test` (`npm test`).
- [x] Grafiksamarbete: `docs/art/ART_BRIEF.md`, första beställningen `REQUEST_001` (soldat, hus 0, gruppkort).

## Fas A – stabil prototyp

- [x] Byggnadsfelet rättat (se nedan). Hela gruppen går in i och ut ur alla sex hus.
- [x] Soldater fastnar inte vid hörn eller dörrposter. Stresstest: 240 slumpade order, 0 fel.
- [x] Soldater står aldrig i en vägg och rör sig aldrig genom en vägg. Kontrolleras varje steg i testerna.
- [x] Skott och sikt respekterar väggar, dörrar och fönster. Varje skott i en hel strid kontrolleras mot siktlinjen.
- [x] Paus fryser simuleringen. Omstart, vinst, förlust och tidsgräns testas.
- [x] Soldater staplas inte på samma punkt (minsta avstånd inom gruppen).
- [x] Soldatanimationerna är bevarade.
- [ ] Gränssnittets texter granskas mot det faktiska beteendet.
- [x] En hel strid genomspelad skriptat i Chromium: order via klick, vinst efter 1:36, resultatskärm och omstart utan konsolfel.
- [ ] Manuell provspelning av Björn.
- [ ] Balans: vinsten räknas i dag trots att två fiendegrupper finns strax utanför målområdet (hör till fas C).

**Byggnadsfelet, orsak och rättning**

Två samverkande orsaker:

1. Vägplaneraren kontrollerade bara steg mellan *rutmittpunkter* i ett rutnät på 20 enheter, men soldaterna står var som helst i en ruta. Den första punkten på rutten kunde därför ligga bakom ett vägghörn sett från soldatens verkliga position. Soldaten kunde inte ta sitt första steg och stod still för alltid.
2. Väggkontrollen samplade linjen var tredje enhet. Därför kunde en linje skära en tunn flik av ett vägghörn eller en dörrpost utan att det upptäcktes, medan själva steget sedan nekades.

Rättningen:

- Väggar är exakta rektanglar med exakt test av linje mot rektangel, både för rörelse och sikt.
- Vägval sker med A* på ett förberäknat rutnät på 10 enheter, där diagonaler inte får skära hörn.
- Sökningen startar från soldatens verkliga position och rutten förenklas därifrån ("string pulling"). Den första punkten är därför alltid direkt gångbar.
- Varje soldat har sin egen cachade rutt. Den planeras om vid behov, högst 8 planeringar per uppdatering.
- Testet för att alla soldater når alla hus rapporterade tidigare bara det första felet (hus 3). Samma fel fanns även i hus 4 och 5.

Resultat: en uppdatering tar cirka 0,8 ms i full strid, mot tidigare 5,4 ms.

## Fas B – terräng och order (nästa)

- [ ] Stenmurar, häckar och passager som geometri, med skydd, sikt och hastighet.
- [ ] Skogsområden som polygoner som följer kartbilden, i stället för cirklar.
- [ ] Terrängberoende rörelsehastighet.
- [ ] Bättre gruppsammanhållning. Formationen klumpar ihop sig vid dörrar i dag.
- [ ] Tydlig skillnad mellan förflytta, försvara och anfalla (en anfallsorder med eget beteende).
- [ ] Återkoppling när en order inte går att utföra.
- [ ] Siktindikering och tydlig information om skydd.
- [ ] Dörrar och fönster per hus med fria positioner, anpassade till kartbilden.
- [ ] Utvecklarläge som är avstängt som standard: kollisioner, dörrar/fönster, rutter, siktlinjer.

## Fas C – stridskänsla och AI

- [ ] Balanserad eldgivning. Nedtryckning skild från förluster.
- [ ] Roller: gevärsgrupp och kulsprutegrupp.
- [ ] Fiende med samma regler: försvarar, reagerar, omgrupperar, drar sig tillbaka, har tidsbegränsat minne.

## Fas D – grafik, ljud och gränssnitt

- [ ] Integrera grafikpaketet REQUEST_001 när det levereras.
- [ ] Zoom och panorering, skärpa på högupplösta skärmar.
- [ ] Bättre ljud, miljöljud, korta röstmeddelanden.

## Fas E – komplett första spel

- [ ] Introduktion, tre uppdrag, genomgångar, resultatskärm, svårighetsnivåer, sparade spel.

## Fas F – kvalitet

- [ ] Provspelning, balans, prestanda, flera webbläsare och skärmstorlekar.

## Kända begränsningar just nu

- Stenmurar, häckar och åkrar i kartbilden är ännu bara dekoration.
- Skogens skyddszoner stämmer dåligt med kartbilden.
- Fiendens AI är mycket enkel.
- Kartan blir något suddig på retinaskärmar.

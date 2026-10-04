# Roadmap – Byn vid fronten

> **Från 2026-10-02 styrs arbetet av `DESIGN.md` och stegen i projektets PROMPTER.md (steg 0–8).** Inventeringen finns i `docs/INVENTERING.md`. Faserna nedan är historik.
>
> - [x] Steg 0 – inventering (godkänd 2026-10-02)
> - [x] Steg 1 – enhetsdata: datafiler, personmodell, tysk Schützenzug 1943 och sovjetisk Strelkovyy vzvod på kartan, engelskt gränssnitt. Godkänt 2026-10-04.
> - [ ] Steg 2 – tillståndsmodell och hotkarta: nedhållning, sammanhållning, eldberedskap, obehag, debugläge (G) med testeld. Väntar på godkännande.

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
- [x] Manuell provspelning av Björn (2026-09-29): in- och utpassering fungerade.
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
- [ ] Formation som vrids efter gruppens riktning, med avstånd anpassade till liggande figurer (se granskning v4).
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

- [x] Grafikprototyp infantry-game-art-v1 (tysk grupp 10, sovjetisk 11) valbar i spelet. Granskad, **ej produktionsgodkänd**: se `docs/art/review/infantry-v1/REVIEW.md`.
- [x] Grafikprov v2 (gevärsskytt redo/liggande) valbart i spelet och speltestat av Claude: se `docs/art/review/rifleman-pilot-v2/REVIEW.md`. **Ej godkänt.**
- [x] Grafikprov v3 (korrigerad kroppsriktning) valbart och speltestat av Claude: `docs/art/review/rifleman-pilot-v3/REVIEW.md`. **Ej godkänt.**
- [x] Grafikprov v4 (gemensam skala i alla poser) valbart och speltestat av Claude: `docs/art/review/rifleman-pilot-v4/REVIEW.md`. **Ej godkänt.**
- [x] Tysk hjälmkorrigering 2 (Schütze, Gruppenführer, MG-Schütze) valbar och speltestad av Claude: `docs/art/review/german-helmet-v2/REVIEW.md`. **Ej godkänd.**
- [x] Tyska stödroller 1 valbara (`pilot-s1`): hela tyska gruppen i v4-stil. Speltestad av Claude: `docs/art/review/german-support-v1/REVIEW.md`. **Ej godkänd.**
- [x] Björn provspelade prototypgrafiken 2026-10-01 och godkände v4-stilen (gevärsskytt v4, tysk hjälm 2, tyska stödroller 1) som grund för fortsatt grafik. Färdig produktionsgrafik kräver fortfarande utslagna, sovjetiska specialister och animationer.
- [x] `REQUEST_002` v1 levererat och valbart (`pilot-r2`): sovjetiska specialister, utslagna båda sidor, rättad sovjetisk registrering. Speltestat av Claude: `docs/art/review/request-002-v1/REVIEW.md`. **Ej godkänt.** Tysk utslagen rättad i v2 (2026-10-02), granskning: `docs/art/review/request-002-german-fallen-v2/REVIEW.md`.
- [ ] Björn provspelar `pilot-r2`.
- [x] `REQUEST_003` v1 levererat och valbart (`pilot-w1`): gångcykel för tysk gevärsskytt, styrd av gången sträcka. Speltestat av Claude: `docs/art/review/request-003-v1/REVIEW.md`. **Ej godkänt.** Kvar: fotglidning mellan rutor (förslag: ben som eget lager), lite synlig rörelse vid normal zoom.
- [x] Björn 2026-10-02: längre steg och lätt vridning i axlar och höfter; uniformsfärgen behålls.
- [x] `REQUEST_004` v1 levererat och valbart (`pilot-w2`): gångcykel i lager, motorn låser stödfoten (uppmätt 0,0 enheters glidning vid rak gång). Speltestat av Claude: `docs/art/review/request-004-v1/REVIEW.md`. **Ej godkänt.**
- [ ] Björn provspelar `pilot-w2`. Vid godkännande: samma lagerupplägg för alla roller båda sidor, därefter krypning.
- [ ] Efter godkänd pilot: gång för alla roller, krypcykel.
- [ ] Integrera REQUEST_001 v1 (SVG-soldat, hus 0, gruppkort) – levererat, ej integrerat.
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

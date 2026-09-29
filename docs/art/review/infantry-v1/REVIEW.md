# Granskning: infantry-game-art-v1 i spelet

Datum: 2026-09-30 · Granskat av: Claude · Status: **PROTOTYP, ej produktionsgodkänd.** Björn har inte provspelat.

Paketet provas via grafikväljaren uppe till höger, eller direkt med `?art=infantry-v1&side=soviet` (du leder den sovjetiska gruppen) respektive `&side=german`. Standardgrafiken är oförändrad och är fortfarande förvald.

## Vad som är gjort

- Atlas, manifest, gruppdefinitioner och leverantörens `draw-soldier.js` är kopierade **oförändrade** till `dist/assets/prototype/infantry-v1/`.
- Bildutsnitten tas från manifestets individuella `rect`, `pivot` och `pixelsPerUnit`. Ingen rutnätsberäkning används.
- Adapterns spärr gäller: rutor märkta `redraw-required` (gång och kryp) byts mot `ready` respektive `prone`. `allowDraft` används aldrig.
- Tillstånden kopplas från spelmotorn så här:
  - redo → `ready`
  - går → `walk-a` eller `walk-b`, som spärras till `ready`
  - liggande → `prone`
  - kryper → `crawl-a` eller `crawl-b`, som spärras till `prone`
  - skjuter liggande → `fire`
  - utslagen → `fallen`
  - Leverantörens `fire`-rutor är liggande. En stående soldat som skjuter visas därför som `ready`.
- Grupperna består av 10 tyska och 11 sovjetiska soldater enligt `german-squad.json` och `soviet-squad.json`. Roll, vapen, delgrupp och sprite-roll följer med varje soldat.
- Formationen har fyra kolumner för grupper större än 6. Femmannagruppen är exakt som förut.
- Varje hus har 18–28 platser. De fem första är de ursprungliga.
- Gruppkorten visar styrkan som `levande / gruppstorlek`, till exempel 11 / 11 och 10 / 10. Totalen och resultattexten räknas från den faktiska styrkan.
- Motorn ritar en mjuk skugga under varje soldat eftersom arken saknar skugga. Ingen mynningsflamma ritas för sprites, eftersom mynningarna inte är kalibrerade. Skottlinjen visas som förut.

## Kontrollerat

**Automatiska tester** (`npm test`, 41 av 41 godkända)

- Gruppstorlek, delgrupper och beväpning enligt definitionerna:
  - Tyskland: 4 + 6 soldater, MP, MG34 och 7 × K98k.
  - Sovjet: 3 + 8 soldater, PPSh, DP, 2 × SVT-40 och 7 × M1891/30.
- Varje soldat har en sprite-roll med alla åtta tillstånd.
- En grupp om 10 respektive 11 går in i och ut ur alla sex hus. Varje steg kontrolleras så att ingen står i eller går genom en vägg.
- Alla hus har minst 11 platser med minst 11 enheters avstånd mellan dem.
- Standardläget har fortfarande 5 soldater per grupp.

**I webbläsare** (Chromium, 1500 × 1000)

- Båda sidorna provades på den riktiga kartan, i normal zoom och förstorat 4×.
- Rotation i 8 riktningar provades för alla tillstånd.
- Grupper om 10 och 11 provades inne i Västra huset och Ladan.
- Inga fel i konsolen. Standardläget är oförändrat (15 man).

Skärmbilder och inspelningar i den här mappen:

| Fil | Innehåll |
|---|---|
| `*-1-normalzoom.jpg` | Hela spelet i normal zoom |
| `*-2-own-squad-4x.jpg`, `*-2-enemy-squad-4x.jpg` | Spelets egna pixlar förstorade 4× på karta och väg |
| `*-3-rotation-poses-4x.jpg` | Alla tillstånd × 8 riktningar, ritade av spelets kod på gräs |
| `*-4-squad-cards.png` | Gruppkort med 11 / 11 och 10 / 10 |
| `*-5-combat-2x.jpg` | Stridsbild vid vägkorsningen, förstorad 2× |
| `*-6-house0-full-squad-4x.jpg`, `*-6-ladan-full-squad-4x.jpg` | Hela gruppen inne i ett hus |
| `*-walk.gif` | Gruppen under förflyttning, där gångrutorna är spärrade |
| `*-combat.gif` | Strid vid vägkorsningen. **Iscensatt:** en soldat per synlig grupp sattes som utslagen tre gånger under inspelningen för att visa växlingen till `fallen`, eftersom spelets nuvarande balans ger mycket få träffar. |

---

## Grafikfel (att skicka till grafikproduktionen)

1. **Redo-figurerna är inte riktade längs +x.**
   - Kroppen står lodrätt i rutan med fötterna nedåt, och geväret pekar snett nedåt höger: cirka 35° för sovjetiska och cirka 15° för tyska figurer.
   - Efter rotation pekar soldaten därför inte åt det håll han går eller siktar. Se rad `ready` i `*-3-rotation-poses-4x.jpg`, kolumn 1 (vinkel 0).
   - Önskemål: axlarna vinkelrätt mot +x, huvudet i mitten och vapnet rakt åt +x.
2. **Liggande figurer har olika skala mellan sidorna.**
   - Stående figurer är lika höga på båda sidor (24,4 enheter), men liggande figurer är 50–53 enheter långa hos sovjetiska soldater mot 34–45 hos tyska.
   - Ett gemensamt mått behövs för liggande längd per sida och roll.
3. **Stående och liggande har mycket olika storlek.** Ungefär 24 mot 40–53 enheter. Vid normal zoom ser liggande soldater ut att bli dubbelt så stora när de går ned.
4. **Delar klipps vid bildutsnittens kanter, eller så finns grannfragment med.** Följande rutor har ogenomskinliga pixlar på ruttens kant (bara stillbilder som inte är spärrade är listade):
   - Tysk: MG-Schütze `fire` (47 px) och `fallen` (25), Assistent `prone` (9), Munitionsträger `fallen` (5), Stellvertreter `fallen` (5), Schütze `prone` (4) och `fire` (4).
   - Sovjet: Squad Leader `fire` (28) och `fallen` (6), Machine Gunner `ready` (6) och `fire` (4), Assistant Gunner `ready` (10), `fire` (38) och `fallen` (14), Senior Rifleman `prone` (29), `fire` (23) och `fallen` (9), SVT-40 Rifleman `ready` (5), `prone` (35), `fire` (30) och `fallen` (12), M1891/30 Rifleman `prone` (24), `fire` (18) och `fallen` (7).
5. **`fire` går knappt att skilja från `prone`.** Kroppsställningen är nästan densamma och det finns ingen rekyl eller flamma. Det är acceptabelt om motorn ritar flamman, men då behöver mynningens position per roll och tillstånd anges i manifestet.
6. **Läsbarhet vid normal zoom.**
   - Sovjetisk khaki smälter in mot grusvägen och torr mark (se `soviet-2-own-squad-4x.jpg` och `soviet-5-combat-2x.jpg`).
   - Tysk fältgrått syns bättre mot gräs men sämre mot skugga och vegetation.
   - Båda saknar den mörka konturen som bar kontrasten i den kodritade soldaten.
   - Vid cirka 20 skärmpixlar per soldat syns hjälm och vapen, men roller som MG-skytt syns inte.
7. **Gång och kryp** är spärrade enligt leveransen och har inte bedömts vidare. När de ritas om behöver de samma riktning, skala och ankare som `ready` och `prone`.

## Integrationsfel och begränsningar (hos Claude, inte grafiken)

1. **Ställning inne i hus.**
   - Liggande figurer på 40–53 enheter får inte plats för 10–11 man i ett rum på ungefär 100 × 90 enheter. De låg därför över varandra i första provet.
   - Nu ritas soldater inne i hus **stående och vända utåt**. Det är bara en ritändring: spelreglerna räknar dem fortfarande som liggande. Panelen visar därför "Liggande · försvar" medan bilden visar stående soldater.
   - Beslut behövs: ska soldater stå inne i hus även i spelreglerna?
2. **Etiketter krockar.**
   - Gruppetiketten ligger över husets namn när gruppen är inne.
   - När flera stora grupper står nära varandra (se `*-5-combat-2x.jpg`) täcker etiketter och markeringsringar soldaterna.
3. **Moral och balans är gjorda för 5-mannagrupper.**
   - Moralförlusten per skott växer med antalet skyttar. Grupperna om 10–11 slår därför ut varandras moral snabbare, och i provet drog sig Bravo tillbaka utan förluster.
   - Träffar är sällsynta i båda lägena, så striden avgörs av reträtter.
   - Det här hör till fas C. Det är inte ändrat i prototypen.
4. **Roller påverkar inte spelet ännu.** MG, kulsprutepistol och gevär skjuter likadant. Rollerna finns i data men används bara för grafiken.
5. **Scenariotexten** säger fortfarande Normandie 1944, medan prototypen visar sovjetiska och tyska grupper. Den är inte ändrad.
6. **Ingen mynningsflamma för sprites**, eftersom mynningspositioner saknas (se grafikfel 5).
7. **Pivotpunkterna används som de är levererade.** Rotationen ser stabil ut kring torson, men ingen finkalibrering är gjord.

## Inte gjort

- Ingen produktionsmärkning. Standardgrafiken är fortfarande förvald.
- Inga ändringar i gång- och krypspärren.
- Ingen retusch av leverantörens bilder.

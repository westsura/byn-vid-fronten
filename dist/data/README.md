# Speldata

Allt som beskriver styrkor, personer, vapen, grader, utmärkelser, texter och uppställning ligger här som JSON. Spelet läser filerna vid start (`src/data.js`). Testerna läser samma filer och kör samma kontroll (`validate`).

| Mapp/fil | Innehåll |
|---|---|
| `weapons.json` | Vapen: räckvidd i meter, eldhastighet, magasin, ammunition, grundträff, nedhållning, tid till full eldberedskap, pipbyte, giltighetsår |
| `ranks/heer.json`, `ranks/waffen-ss.json`, `ranks/rkka.json` | Grader per formation: namn, förkortning, beteckning, giltighetsår. Waffen-SS har Heer-motsvarighet. Röda armén har beteckning för både axelklaff och kragspegel |
| `awards/de.json`, `awards/su.json` | Utmärkelser: namn, förkortning, krav, bärordning, om de bär en symbol |
| `units/de-heer-1943.json`, `units/su-rkka-1943.json` | Befattningar (föreskriven grad, vapen, figur) och förbandstyper med platser, ledare och trupper (MG-Trupp / Schützentrupp) |
| `people/*.json` | Personer: id, namn, formation, grad, befattning, vapen, utmärkelser, födelseår och status. Personen är skild från förbandet |
| `forces/*.json` | En styrka: vilka förband som ingår och vilka personer som står på vilka platser |
| `scenarios/proto-1943.json` | År, vilka styrkor som möts, utgångslägen och snabbtangenter |
| `rules/condition.json` | Tillståndsmodell och hotkarta (steg 2): nedhållning, sammanhållning, eldberedskap, obehag, rutnät och gränser för Pinned/Broken |
| `rules/fire.json` | Eld och siktlinje (steg 3): skala meter per kartenhet, upptäcktsavstånd, skymmande terräng, eldtillfällen per vapentyp, träff- och nedhållningsfaktorer, flankering |
| `rules/orders.json` | Delad grupp (steg 3): var Schützentrupp ställer sig vid delning och hur nära trupperna måste stå för att slås ihop |
| `rules/effects.json` | Grundeffekter (steg 3): nedslag per material, spårljus, kamerastöt (trauma), stridskontakt utanför bild |
| `text/en.json` | All gränssnittstext på engelska. Förband, befattningar, grader och utmärkelser kommer från filerna ovan, på tyska respektive i rysk translitterering |

## Lägga till eller ändra

- **Ny soldat:** lägg till en person i `people/` och ange hans id på en plats i `forces/`.
- **Nytt år:** ny förbandstyp med `validYears` i `units/`. Grader och vapen har egna giltighetsår, och kontrollen varnar om något inte stämmer med scenariots år.
- **Ny text:** lägg till nyckeln i `text/en.json` och använd `t('nyckel')` i koden.

Kör `npm test` efter ändringar. Testet `data.test.js` visar vad som inte stämmer.

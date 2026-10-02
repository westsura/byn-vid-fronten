# Integrerad grafik

| Tillgång | Paket | Fil i spelet | Integrerad | Kommentar |
|---|---|---|---|---|
| Kartbild Saint-Martin | (före paketsystemet) | `dist/map.png` | ja | 1536 × 1024, 1,28 px/enhet |
| Soldater | (före paketsystemet) | `dist/src/soldiers.js` | ja | Kodritade |

| Infanteri-sprites tysk 10 / sovjetisk 11 (**PROTOTYP**) | infantry-game-art-v1 | `dist/assets/prototype/infantry-v1/` | valbar, ej standard | Ej produktionsgodkänd. Granskning: `docs/art/review/infantry-v1/REVIEW.md` |
| Gevärsskytt redo/liggande tysk + sovjetisk (**GRAFIKPROV V2**) | infantry-rifleman-pilot-v2 | `dist/assets/prototype/rifleman-pilot-v2/` | valbar, ej standard | Endast Schütze/Rifleman M1891/30; övriga roller v1. Granskning: `docs/art/review/rifleman-pilot-v2/REVIEW.md` |
| Gevärsskytt redo/liggande, korrigerad riktning (**GRAFIKPROV V3**) | infantry-rifleman-pilot-v3 | `dist/assets/prototype/rifleman-pilot-v3/` | valbar, ej standard | Som v2 i omfattning; `&scale=helmet`, `&shadow=none|small|oval`. Granskning: `docs/art/review/rifleman-pilot-v3/REVIEW.md` |
| Gevärsskytt redo/liggande, gemensam skala 28 px/enhet (**GRAFIKPROV V4**) | infantry-rifleman-pilot-v4 | `dist/assets/prototype/rifleman-pilot-v4/` | valbar, ej standard | `&spacing=wide`, `&shadow=`. Granskning: `docs/art/review/rifleman-pilot-v4/REVIEW.md` |
| Tysk Schütze, Gruppenführer, MG-Schütze med kortare nackkant (**HJÄLMKORRIGERING 2**) | german-helmet-correction-v2 | `dist/assets/prototype/german-helmet-v2/` (+ `german-helmet-v1-before/` för jämförelse) | valbar (`?art=pilot-h2`), ej standard | Granskning: `docs/art/review/german-helmet-v2/REVIEW.md` |
| Tyska stödroller: Assistent-MG-Schütze, Munitionsträger, Stellvertreter (**STÖDROLLER 1**) | german-support-roles-v1 | `dist/assets/prototype/german-support-v1/` | valbar (`?art=pilot-s1`), ej standard | Hela tyska gruppen i v4-stil. Granskning: `docs/art/review/german-support-v1/REVIEW.md` |
| Sovjetiska specialister (gruppchef, kulspruteskytt, assistent, SVT), utslagna båda sidor, rättad sovjetisk registrering (**REQUEST_002 v1**) | REQUEST_002-v1 | `dist/assets/prototype/request-002-v1/` | valbar (`?art=pilot-r2`, `&reg=v4` för jämförelse), ej standard | Alla 21 soldater i v4-stil. Granskning: `docs/art/review/request-002-v1/REVIEW.md` |
| Tyska utslagna, rättad hjälm och anatomi (**REQUEST_002 tysk utslagen v2**) | REQUEST_002-german-fallen-v2 | `dist/assets/prototype/request-002-german-fallen-v2/` | används i `pilot-r2`/`pilot-w1` (`&fallen=v1` för jämförelse), ej standard | Granskning: `docs/art/review/request-002-german-fallen-v2/REVIEW.md` |
| Gångcykel, pilot: tysk Schütze K98k, 8 rutor, sträckstyrd (**REQUEST_003 v1**) | REQUEST_003-v1 | `dist/assets/prototype/walk-pilot-v1/` | valbar (`?art=pilot-w1`), ej standard | Motorn: `walked` per soldat. Granskning: `docs/art/review/request-003-v1/REVIEW.md` |
| Gångcykel v2 i lager (vänster ben, höger ben, överkropp), tysk Schütze, fotlåsning i motorn (**REQUEST_004 v1**) | REQUEST_004-v1 | `dist/assets/prototype/walk-v2-layers/` | valbar (`?art=pilot-w2`, `&footlock=off`), ej standard | Granskning: `docs/art/review/request-004-v1/REVIEW.md` |

Levererat men ej integrerat: `REQUEST_001` v1 (SVG-soldat, hus 0, gruppkort) i `art/incoming/REQUEST_001-v1/`.

**Björns provspelning 2026-10-01:** v4-stilen godkänd som grund (gevärsskytt v4, tysk hjälmkorrigering 2, tyska stödroller 1). Lägena är fortfarande valbara prov, inte standardgrafik; märket i spelet står kvar tills helheten (utslagna, specialister, animationer) är på plats.

Beställt: `REQUEST_002` (levererat och integrerat som prov `pilot-r2`), `REQUEST_003` (levererat och integrerat som prov `pilot-w1`), `REQUEST_004` (levererat och integrerat som prov `pilot-w2`).

**2026-10-02 (steg 1):** Spelet har två grafiklägen: *Sprites* (standard: v4-figurerna med hjälm 2, stödroller 1, REQUEST_002, tysk utslagen v2 och gångcykel v2 i lager) och *Code-drawn* (reserv). Äldre prov (v1, v2, v3, hjälm 1, gångcykel v1) är borttagna ur `dist/` men finns kvar i `art/incoming/`, i granskningarna och i git-historiken. Vilken figur en soldat får styrs av befattningen i `dist/data/units/`.

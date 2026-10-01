# REQUEST_002 – Sovjetiska specialister och utslagna soldater

Paket: `REQUEST_002` · version 1 · 2026-10-01
Beställare: Björn · Teknisk specifikation: Claude · Utförare: GPT

## Bakgrund

Björn provspelade grafikproven 2026-10-01 och godkände v4-stilen som grund för fortsatt grafik. Godkännandet gäller:

- gevärsskytten v4 (båda sidor);
- tysk hjälmkorrigering 2;
- tyska stödroller 1.

Den tyska gruppen har nu tio figurer i samma stil. Den sovjetiska gruppen har v4-gevärsskyttar men äldre v1-figurer för specialisterna. Utslagna soldater visas med v1-figurer på båda sidor.

Paketet har tre delar, alla stillbilder:

1. **Del 1:** fyra sovjetiska specialistfigurer i v4-stil, i ställningarna redo och liggande.
2. **Del 2:** utslagna soldater, tysk och sovjetisk.
3. **Del 3:** rättade registreringspunkter för den sovjetiska gevärsskytten. Det är bara manifestvärden; bilden ska inte ritas om.

Gång och kryp ingår **inte**. Gångcykeln beställs separat i `REQUEST_003`.

## Gäller före ART_BRIEF avsnitt E

Avsnitt E i `ART_BRIEF.md` beskriver den ursprungliga planen med kodritade soldater och SVG. Spelet använder i dag rasterbilder med manifest, enligt v4-paketen. Vid konflikt gäller den här beställningen.

## Gemensamma tekniska krav (KRAV)

- **Skala:** 28 källpixlar per spelenhet i alla figurer och poser, samma som v4.
  - Normalisera inte efter vapenlängd eller bildbredd.
  - Kropp, hjälm och axlar ska ha samma storlek som v4-gevärsskytten i `reference/soviet-poses-v4.png`.
- **Riktning:** figuren är vänd åt höger (+x). Vinkel 0 pekar höger, och positiv vinkel roterar medurs på canvas.
- **Utsnitt:** ett ark per roll, 1254 px brett.
  - Redo: `sourceRect [0, 0, 1254, 700]`.
  - Liggande: `[0, 700, 1254, 554]`.
  - Om något inte ryms i den layouten får arket vara större. Ange då verkliga `sourceRect`.
- **Bakgrund:** genomskinlig, utan bakade skuggor, rutnät eller text.
- **Ljus och perspektiv:** samma ljus, perspektiv rakt ovanifrån och linjetjocklek som v4. Inga verkliga emblem, gradbeteckningar eller nationella symboler.
- **Manifest:** samma format som `reference/manifest-example-german-support-v1.json`.
  - Ange per bildruta: `file`, `sourceRect`, `pivot`, `muzzle`, `helmetCenter`, `pixelsPerUnit`, `sourceForwardRadians`, `contentBoundsAlpha32`, `status` och `registration`.
  - `pivot` är axlarnas mittpunkt, relativt utsnittet. Det är den punkt spelet placerar och roterar soldaten kring.
  - `muzzle` är vapnets mynning. Spelet ritar mynningsflamman där.
  - Ange `"status": "new-role-not-approved"`.
- **Mätfil:** `measurements.json` per bildruta, med:
  - `widthUnits`;
  - `muzzleForwardUnits`;
  - `muzzleSideUnits`, där mynningens sidoavvikelse från axellinjen ska vara under 0,5 enheter;
  - `helmetDiameterUnits`.

## Del 1 – Sovjetiska specialister

Rollerna och vapnen kommer från `reference/soviet-squad.json`, som spelet redan använder.

| Manifestnyckel (+ `-ready`, `-prone`) | Spelroll (`role` i squad-filen) | Vapen | Används för |
|---|---|---|---|
| `soviet-leader` | Squad Leader | PPSh-41 med trummagasin | soviet-01 |
| `soviet-mg` | Machine Gunner | DP (DP-27) med skivmagasin ovanpå och tvåbensstöd | soviet-02 |
| `soviet-assistant` | Assistant Gunner | M1891/30, samt bärlåda eller väska för DP-magasin | soviet-03 |
| `soviet-svt` | Senior Rifleman och Rifleman med SVT-40 | SVT-40 | soviet-04, soviet-05 |

**Leverans:** `soviet-leader.png`, `soviet-mg.png`, `soviet-assistant.png`, `soviet-svt.png`. **KRAV**

**Krav på figurerna**

- **KRAV:** Samma kropp, uniform, hjälm och färgton som den sovjetiska v4-gevärsskytten. Roll och vapen ska vara det enda som skiljer figurerna åt.
- **KRAV:** Byte mellan redo och liggande ska ske med fast axelpunkt.
  - Hjälmcentrum får flytta högst 0,5 enheter.
  - Mynningen får flytta högst 1 enhet framåt eller bakåt och högst 0,5 i sidled.
  - V4 flyttar 0,1–0,4 enheter. Det är målet.
- **KRAV:** Kulspruteskytten och assistenten ska gå att känna igen som kulsprutelag vid 4× och helst vid normal zoom.
  - DP:s runda skivmagasin är en naturlig silhuett. Gör det tydligt, men inte överdrivet.
  - Erfarenhet från den tyska gruppen: ammunitionslådor och fodral syns först vid cirka 8×. Det räcker inte för att spelaren ska hitta laget på kartan.
- **FÖRSLAG:** Gruppchefen får en diskret skillnad i utrustning, till exempel kartfodral eller kikare. Inga gradbeteckningar.
- **FÖRSLAG:** Den sovjetiska khakin har svagast kontrast mot grusvägen av alla figurer. Om en något mörkare kontur eller ett svagt kantljus på axlar och hjälm hjälper, visa det på **en** av de nya figurerna som jämförelse.
  - Ändra inte gevärsskytten i det här paketet.
  - Björn avgör om det ska gälla alla.

## Del 2 – Utslagna soldater

En utslagen soldat ligger kvar där han föll, roterad efter sin sista riktning. Spelet tonar ned figuren och ritar den under levande soldater.

| Manifestnyckel | Figur |
|---|---|
| `german-fallen-a`, `german-fallen-b` | Tysk soldat med K98k, två varianter |
| `soviet-fallen-a`, `soviet-fallen-b` | Sovjetisk soldat med M1891/30, två varianter |

**Leverans:** `german-fallen.png`, `soviet-fallen.png`. Båda varianterna ligger på samma ark. **KRAV**

- **KRAV:** Samma skala, uniform och hjälm som v4. Den tyska figuren ska ha hjälmen från hjälmkorrigering 2.
- **KRAV:** Läses som utslagen vid normal zoom och går inte att förväxla med en liggande, skjutande soldat. Det betyder:
  - Vapnet pekar inte rakt framåt och ligger inte i skjutställning, utan bredvid eller snett från kroppen.
  - Kroppen är vriden, delvis på sidan eller ihopsjunken.
  - Minst en arm ligger utkastad eller under kroppen.
- **KRAV:** Inget blod, inga synliga skador och inga detaljerade ansikten.
- **KRAV:** Leverera med full opacitet och normal färgton. Spelet sköter nedtoningen, så att nivån kan justeras utan nya bilder.
- **KRAV:** Hela figuren inklusive vapen ryms inom cirka 45 × 30 spelenheter (1260 × 840 källpixlar). Annars täcker de stupade för mycket av kartan i en grupp med tio–elva soldater.
- **KRAV:** `pivot` är bålens mitt, ungefär där axlarna var när soldaten stod. Då ligger den stupade på samma plats som den levande figuren. Ange `muzzle` som `null`.
- De två varianterna ska ha tydligt olika form, så att flera stupade bredvid varandra inte ser kopierade ut. Spelet väljer variant per soldat.
- Spelet använder tills vidare samma utslagna figur för alla roller på en sida. **FÖRSLAG:** `german-mg-fallen` och `soviet-mg-fallen`, där kulsprutan ligger bredvid, om det ryms i leveransen.

## Del 3 – Sovjetisk gevärsskytt: rättade registreringspunkter

I v4 ligger den sovjetiska mynningen 1,9 enheter (redo) respektive 1,4 enheter (liggande) i sidled från axellinjen. Den tyska ligger på 0,2–0,4. Geväret pekar parallellt med riktningen, men förskjutet åt höger, så spelets riktning och vapnets linje stämmer inte helt. Se `reference/v4-atta-riktningar-markerade-4x.jpg`.

**Leverans:** `soviet-rifleman-registration.json` med nya värden för `pivot`, `muzzle` och `helmetCenter`, för `soviet-ready` och `soviet-prone`. Gäller samma bild, `soviet-poses.png` i v4. **KRAV**

- Flytta axelmittpunkten (`pivot`) i sidled så att vapnets linje går genom eller mycket nära den. Det är bättre än att rita om figuren.
- Om det ger en uppenbart sned kropp, säg det i `TILL-CLAUDE.md` och föreslå en lösning i stället.

## Bifogat underlag

| Fil | Innehåll |
|---|---|
| `REQUEST_002.md` | Den här beställningen |
| `ART_BRIEF.md` | Gemensamt underlag. Avsnitt E är delvis inaktuellt, se ovan |
| `reference/soviet-poses-v4.png`, `reference/manifest-v4.json` | Sovjetisk och tysk gevärsskytt v4 med manifest. Stilen och skalan som gäller |
| `reference/german-rifleman-helmet-v2.png`, `reference/manifest-german-helmet-v2.json` | Aktuell tysk gevärsskytt, grund för `german-fallen` |
| `reference/manifest-example-german-support-v1.json` | Manifestformatet att följa |
| `reference/soviet-squad.json` | Sovjetisk gruppsammansättning, roller och vapen |
| `reference/tyska-gruppen-alla-roller-8x.jpg` | Den godkända tyska gruppen: sex roller, redo och liggande. Visar vilken enhetlighet som eftersträvas |
| `reference/sovjet-blandad-grupp-vag-4x.jpg` | Dagens sovjetiska grupp i spelet: v4-gevärsskyttar och v1-specialister, som ska ersättas |
| `reference/v1-alla-stallningar-inkl-utslagen-4x.jpg` | Äldre v1-gevärsskytt i alla ställningar och åtta riktningar, båda sidor. Raden *fallen* är den utslagna figur som ska ersättas |
| `reference/v4-atta-riktningar-markerade-4x.jpg` | V4 i åtta riktningar. Gult kors är axelpunkten, blå ring hjälmen och röd prick mynningen |

## Leverans

Mappen eller zip-filen `REQUEST_002-v1/` ska innehålla:

- de sex PNG-arken i del 1 och 2;
- `soviet-rifleman-registration.json`;
- `manifest.json` för alla nya bildrutor;
- `measurements.json`;
- `preview.html`, som visar nya figurer bredvid v4-gevärsskytten i åtta riktningar, i 1× och 4×, och de utslagna bredvid en liggande soldat;
- `TILL-CLAUDE.md`, en kort integrationsanvisning med kända avvikelser;
- `VALIDATION.md`, med det du själv har kontrollerat;
- `PROMPTS.md`.

## Överlämning och godkännande

1. **GPT** levererar paketet och stannar där. Ingen gång, kryp eller animation i det här paketet.
2. **Claude** gör följande:
   - integrerar paketet som ett nytt valbart grafikprov;
   - behåller tidigare lägen som reserv;
   - kontrollerar punkterna nedan i spelet;
   - lämnar skärmbilder och en granskning. Grafikfel och integrationsfel redovisas var för sig.
3. **Björn** provspelar och godkänner eller begär ändringar.

**Paketet godkänns när:**

1. Alla KRAV-filer finns, med rätt namn och 28 px per enhet.
2. De fyra specialisterna har samma kropps- och hjälmstorlek som den sovjetiska v4-gevärsskytten, i båda poserna.
3. Byte mellan redo och liggande håller sig inom gränserna ovan. Mynningsflamman hamnar vid mynningen i åtta riktningar.
4. Kulsprutelaget går att känna igen vid 4×.
5. Utslagna går att skilja från liggande vid normal zoom på väg, gräs och i mörk vegetation.
6. Den sovjetiska gevärsskyttens mynning ligger mindre än 0,5 enheter från axellinjen med de nya värdena.
7. Björn godkänner efter provspelning.

Redovisa avvikelser i `TILL-CLAUDE.md` med skäl. Det är bättre än en leverans som ser rätt ut men inte passar spelet.

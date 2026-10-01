# Speltest: german-support-roles-v1

Datum: 2026-10-01 · Granskat av: Claude · Status: **EJ GODKÄNT.** Björn har inte provspelat.

## Så provas det

Öppna `?art=pilot-s1&side=german` (eller `&side=soviet`). Märket lyder "GRAFIKPROV V4 · TYSK GRUPP MED STÖDROLLER 1 – EJ GODKÄNT". Lägg till `&spacing=wide` för formationsavstånd × 1,5.

Tidigare lägen (standard, v1–v4, pilot-h2) finns kvar och laddar utan fel.

## Integration

- De tre nya arken och manifestet är kopierade **oförändrade** till `dist/assets/prototype/german-support-v1/`. Skalan är 28 px per enhet, utan normalisering efter vapen.
- `reference-current` i paketet är byte för byte identiskt med hjälmkorrigering 2, som redan används. Därför finns ingen dubblett i spelet.
- I `pilot-s1` har **alla tio tyska soldater** v4-grafik:

  | Roll | Antal | Grafik |
  |---|---|---|
  | Gruppenführer | 1 | Hjälm 2 |
  | MG-Schütze | 1 | Hjälm 2 |
  | Assistent-MG-Schütze | 1 | Stödroller 1 |
  | Munitionsträger | 1 | Stödroller 1 |
  | Stellvertreter Gruppenführer | 1 | Stödroller 1 |
  | Schütze | 5 | Hjälm 2 |

- Den sovjetiska sidan har v4-gevärsskyttar och v1-specialister.
- Utslagna visas med v1-figur. Gång och kryp är spärrade.
- Spelregler, vapenegenskaper och gruppstorlek är oförändrade. Alla 41 tester går igenom.

## Kontroller enligt TILL-CLAUDE

**Kropp och hjälmstorlek** (`1a`, `1b`, `2-alla-sex-roller-narbild-8x.jpg`)

- Alla sex tyska roller har samma kropps- och hjälmstorlek i båda poserna. Ingen figur sticker ut.
- Assistentens kortare pistol har inte gjort kroppen större.

**Rotationspunkt och mynning**

- Axelpunkt och hjälmcentrum ligger stabilt i alla åtta riktningar.
- Mynningspunkterna stämmer, och mynningsflamman hamnar vid pistolen respektive geväret (`1c`).

**Mynning vid byte mellan stående och liggande** (beräknat från manifestet)

| Roll | Stående | Liggande | Förflyttning |
|---|---|---|---|
| Assistent | 12,1 enheter fram, −0,7 i sidled | 13,0 fram, −0,4 i sidled | cirka 1 enhet |
| Ammunitionsbärare, ställföreträdare | 18,5 fram | 18,8 fram | cirka 0,3 enhet |

Båda värdena stämmer med leverantörens uppgift (0,95 respektive 0,34). Inget märkbart hopp syns.

**Hela tiomannagruppen** (`3a`, `3b`, `4a`, `4b`)

- På väg, gräs och i mörk vegetation ser gruppen nu enhetlig ut. Stilblandningen med v1-figurer är borta på den tyska sidan.

## Grafikfel och iakttagelser (att skicka till grafikproduktionen)

1. **Rollerna går inte att skilja åt vid normalzoom**, utom assistenten med sin korta pistol. Ammunitionslådor, kartfodral och kikarfodral syns först vid cirka 8×. Det är acceptabelt om rollen ska synas i gränssnittet i stället, men inte om spelaren ska känna igen MG-laget på kartan.
   - **Förslag:** något tydligare silhuett för MG-laget, till exempel en synlig reservpipa eller en större ammunitionslåda. Alternativt löser vi det i motorn med en liten rollmarkering vid vald grupp.
2. **Ammunitionslådorna** har fortfarande rundade hörn och ser i närbild delvis ut som burkar, som leverantören själv påpekar. Det märks inte vid normalzoom.
3. **Kvar sedan tidigare:** gång, kryp och utslagen saknas. Alfakanterna är inte slutrensade, men inga rester syns i spelet.
4. **Sovjetiska specialister** (gruppchef, kulspruteskytt, assistent, äldre skytt med SVT) har fortfarande v1-grafik. Det är nästa motsvarande paket för den sovjetiska sidan.

## Integration och begränsningar (hos Claude)

1. **Formationen.** Liggande soldater på cirka 40 enheter ligger huvud mot fötter i kedjor (`4a`, `4b`, högra delen), även med × 1,5 avstånd. Som TILL-CLAUDE anger ska det lösas i motorn med en formation som vrids efter gruppens riktning, inte genom att krympa figurerna. Det står i ROADMAP, fas B.
2. **Utslagna** visas med v1-figur.
3. **Inne i hus** ritas soldaterna stående medan spelreglerna räknar dem som liggande. Oförändrat.

## Filer

| Fil | Innehåll |
|---|---|
| `1a-redo-8-riktningar-4x.jpg`, `1b-liggande-8-riktningar-4x.jpg` | De tre nya rollerna och gevärsskytten i 8 riktningar. Gult kors = axelpunkt, blå ring = hjälm, röd prick = mynning |
| `1c-eld-flamma-4x.jpg` | Liggande eld med mynningsflamma |
| `2-alla-sex-roller-narbild-8x.jpg` | Alla sex tyska roller, stående och liggande, 8× (gruppchef, MG, assistent, ammunitionsbärare, ställföreträdare, gevärsskytt) |
| `3a-normalzoom-standardavstand.jpg`, `3b-…-brett-avstand.jpg` | Hela spelet i normalzoom med fullständiga tyska grupper |
| `4a-hel-grupp-4x-standardavstand.jpg`, `4b-…-brett-avstand.jpg` | Tiomannagrupp 4×: väg (stående), mörk vegetation (stående), gräs (liggande) |
| `5-strid-normalzoom.jpg`, `5-strid-2x.jpg` | Tysk sida i pågående strid |

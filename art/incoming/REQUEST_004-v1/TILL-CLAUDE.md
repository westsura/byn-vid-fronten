# REQUEST_004-v1 – gång v2, tysk gevärsskytt

Ny valbar pilot för enbart tysk Schütze. Behåll v1 som reserv. Paketet ändrar inte utslagna, sovjetiska figurer eller andra roller. Björn har ännu inte godkänt denna gångversion.

## Leverans

- Åtta rutor, 1254 × 700 per lager, 28 källpixlar/enhet, pivot [600,390].
- Tre lager per ruta i manifestets ordning: leg-left, leg-right, upper. Alla delar samma pivot. Ingen extra förskjutning är inbakad i benlagren.
- Lageratlas: 5016 × 4200. Sammanslagen reservatlas: 5016 × 1400. Använd sourceRect; anta inte sammanhängande rader per lager.
- Cykellängd 40 enheter, alltså 5 enheter per ruta. Kontakt 0/4, passage 2/6.
- Vänster stödben i 0–3, höger i 4–7. plantedFoot är stövelns referenspunkt på markplanet, inte en färgmarkering.
- Höftfästena vrids ±8° i benriggen; överkroppen vrids motsatt ±3,2° runt hjälmcentrum. Pivot ligger kvar. Höftfästena har dold överlappning under överkroppen så att maximal lagerförskjutning inte frilägger benets överkant.
- Passage 2/6 har överkroppen i redo-läge och benen nära under kroppen. Stoppa med befintlig redo-bild enligt tidigare beteende.
- Ingen färgkorrigering eller ny utrustning. Referens och tidigare genererade ben återanvänds genom den befintliga Canvas-baserade riggen.

## Lagerförskjutning vid rak gång

Låt distance vara soldatens verkliga gångsträcka inklusive fasförskjutning. phase = positiv modulo(distance,40), frame = floor(phase/5), within = phase - frame*5.

Förskjut ENDAST lagret `leg-${plantedLeg}` med [-within*28,0] källpixlar innan figurens rotation. Rita övriga lager utan förskjutning. Skala sedan allt med spelets skala/28 och använd samma pivot. Detta gäller konstant riktning och rak förflyttning. Förskjut inte upper eller båda ben samtidigt.

Vid rutbyten fortsätter fotpunkten bakåt med exakt 140 källpixlar. Därmed blir markpunkten kontinuerlig även när within går tillbaka till noll. Vid byte av stödben börjar en ny kontakt; jämför inte olika fötters markpunkter som om de vore samma fot.

För svängar och sidledsförflyttning behöver motorn hålla kontaktpunkten i världens koordinater och räkna om förskjutningen till figurens lokala koordinater, eller återställa kontakten när riktningen ändras. Enbart gångsträcka längs ny riktning kan inte garantera fotlåsning vid sväng. Förhandsvisningen och beräkningen här verifierar rak gång vid 0° och 45°.

## Mätning och nästa speltest

Kontakt 0: tå +7,04 enheter, häl +4,68. Kontakt 4: tå +7,39, häl +4,61. Tåns avstånd mäts mot överkroppens synliga kontur i stövelns sidoläge (±30 källpixlar); gevärets spets räknas inte som kroppskontur. Hälen jämförs med packningens bakre kontur. Mellanlägen kan ha negativt avstånd eftersom foten döljs; kravet på minst 4 gäller kontaktlägen.

Mynningens största avvikelse: 0,910 enheter sidledes och 0,056 längsledes. Hjälmcentrum står still. Läs muzzle per ruta för skott under gång. Hela upper vrids; inga separata vapenförskjutningar behövs.

Kontrollera fotglidning i motorn, läsbarhet i hel grupp vid normal zoom och byte gång/redo/skott. Den matematiska kontrollen ersätter inte speltest. Samtliga roller utom denna pilot behåller tidigare grafik.

preview.html är fristående med inbäddad atlas: grupp i 1×, tre figurer i 4×, paus, hastighet, riktning och fotlåsning på/av. Kameran följer figurerna och rutnätet visar marken. walk-strip-4x.png visar sammansättning samt ben separat. between-frames-4x.png visar största lagerförskjutningen i 0° och 45°.

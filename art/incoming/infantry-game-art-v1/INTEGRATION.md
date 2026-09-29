# Infanteri – första integrationsprototypen

Status: tekniskt testpaket, inte färdiggodkänd spelgrafik. Två transparenta PNG-ark, 96 bildrutor beskrivna i manifest.json, fristående förhandsvisning och Canvas2D-adapter. Genererat med inbyggd imagegen från de godkända konceptbilderna. Se PROMPTS.md.

## Öppna
Öppna preview.html med preview.js kvar i samma mapp. Bilder och manifest är inbäddade i HTML så förhandsvisningen inte behöver hämta JSON. Kontrollera ställning, zoom, underlag och rotation. Gångtest är endast för granskning. Zoom1 motsvarar ungefär tidigare projektskala, där redofigurens höjd inklusive utrustning är24spelenheter; ingen mätning mot Claudes faktiska spelkamera är genomförd.

## Innehåll och användning
- german-atlas.png och soviet-atlas.png:1448×1086 RGBA vardera. Källbilderna är inte ommålade eller reskalade med kod.
- manifest.json: sex rollrader per sida och åtta ställningar. Rutorna är INTE lika stora. Använd rect från manifest, inte en8×6-gridberäkning.
- rect=[käll-x,käll-y,bredd,höjd], pivot=[x,y] relativt rutan. pixelsPerUnit anger ritningsskala. Pivot är en första uppskattning vid torso/axlar och behöver kalibreras i animation.
- draw-soldier.js: ES-modul. Ladda PNG och manifest, anropa drawSoldier(ctx,image,atlas,{role,state,x,y,angle,scale}). angle i radianer, rollindex0–5. Spelmotorn äger position, riktning, tid och paus.
- Defekta walk/crawl-ställningar får review=redraw-required. Adaptern visar ready eller prone i stället, om inte allowDraft:true uttryckligen anges. Övriga rutor har visual-review-required, inte approved.
- Mynningsflamma och skugga ingår inte som separata lager; lägg dessa i motorn när respektive vapens mynning är kalibrerad. Vissa fire-rutor är liggande: växla inte automatiskt från stående till liggande varje skott.
- PNG har sammanbakad utrustning. Det tidigare SVG-kontraktets separata huvud/ben/vapenlager gäller inte dessa rasterfiler.

## Grupper
Tysk grupp10: Gruppenführer, MG-Schütze, Assistent-MG-Schütze, Munitionsträger, Stellvertreter Gruppenführer och fem Schütze.
Sovjetisk grupp11: Squad Leader, Machine Gunner, Assistant Gunner, Senior Rifleman, en SVT-40 Rifleman och sex M1891/30 Rifleman.
Gruppdefinitionerna är kopierade från tidigare underlag. Undergruppernas4+6 respektive3+8 ändras inte.

## Faktisk granskning och kända fel
-48huvudfigurer hittade i varje arks alfakanal; separata vapen hos utslagna är inkluderade i deras bildrutor. Fördelning6roller×8ställningar.
-Rutornas gränser har korrigerats efter sammanhängande alfaytor. Enstaka grannfragment kan kvarstå där figurernas omslutande rektanglar överlappar; detta behöver bildretusch/nygenerering före slutleverans.
-Gång/kryp följer inte konsekvent höger riktning. En del vapen försvinner eller byter form och sovjetiska gruppchefen byter huvudbonad i vissa kryprutor. Dessa är uttryckligen underkända.
-SVT-40/Mosin och MP/MG-siluetter behöver detaljgranskning i varje ställning. Konceptens utseende är referens; att en ruta finns betyder inte att vapnet är godkänt.
-Storlek och rotationspunkter är preliminära. Rörelse mellan bildrutor kan hoppa. Ljus roterar med rasterbilden.
-Kontrollerat i separat webbläsarförhandsvisning: visning, ställningsval,1×/2×/4×, start/paus för gångtest. Ingen integration, prestandatest eller speltest i Claudes Vercelbygge har gjorts.

## Nästa produktionspass
Rita om rörelsebilderna per roll i små serier med fast vapen, hjälm och torsoankare. Kalibrera rörelsen mot stillbilden, kontrollera spritekanter på riktiga karttexturer och exportera slutlig atlas först efter att dessa tester passerat. Detta paket får läggas i art/incoming, men bör inte ersätta fungerande produktionsgrafik automatiskt.


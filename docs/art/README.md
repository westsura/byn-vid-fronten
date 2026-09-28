# Grafikunderlag

- `ART_BRIEF.md` – gemensamt tekniskt och visuellt underlag (skicka alltid med).
- `REQUEST_nnn.md` – enskilda beställningar.
- `INTEGRATED.md` – vilken grafik som finns i spelet.
- `geometry/village.json` – spelets verkliga geometri. Återskapas med `node scripts/export-geometry.mjs`.
- `reference/` – skärmbilder och geometribilder. Geometribilderna återskapas med `python3 scripts/draw-geometry.py`.
- Skärmbilder tas med `python3 scripts/capture-refshots.py` och `python3 scripts/capture-posesheet.py` (Playwright + Chromium; sparar PNG, som sedan kan konverteras till JPEG).

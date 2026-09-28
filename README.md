# Byn vid fronten

Taktiskt infanterispel i realtid, sett rakt ovanifrån. Operation Morgonljus, en fransk by 1944.
Ren HTML, CSS och JavaScript (ES-moduler) med Canvas 2D. Inget byggsteg.

Spela: https://byn-vid-fronten.vercel.app

## Starta lokalt

ES-moduler kräver en webbserver (att öppna `index.html` direkt som fil fungerar inte):

```
npm start                              # serverar dist/ på http://localhost:8080
# eller utan npm:
python3 -m http.server 8080 -d dist
```

## Testa

```
npm test           # simuleringstester i Node 20+ (ingen webbläsare krävs)
```

Testerna kör simuleringen utan gränssnitt. De kontrollerar bland annat att hela gruppen kan gå in i och ut ur alla sex hus, att ingen soldat står i eller passerar genom en vägg, att skott följer siktlinjer, samt paus, vinst, förlust och omstart.

## Struktur

```
dist/                 det som publiceras
  index.html, style.css, map.png
  src/
    config.js         kartstorlek, uppdragstider
    scenario.js       hus, skog, mål, startgrupper
    terrain.js        väggar, dörrar, fönster, skydd, sikt (exakt geometri)
    nav.js            vägval (A* på 10-enhetersrutnät)
    sim.js            simulering: order, rörelse, strid, moral, uppdragsslut
    soldiers.js       ritning av soldater
    render.js         ritning av karta, hus, grupper, effekter
    ui.js             sidopanel, overlay, tangentbord och mus
    audio.js          syntetiska skottljud
    main.js           startpunkt och bildloop
tests/                node:test
docs/art/             grafikunderlag och beställningar till GPT
art/incoming/         inkommande grafik (publiceras inte)
scripts/              geometriexport och skärmbilder för grafikunderlaget
```

## Publicering

Vercel-projektet `byn-vid-fronten` (westsuras-projects) serverar `dist/` direkt (se `vercel.json`). Varje push till `main` publiceras.

Se `ROADMAP.md` för vad som är klart och vad som återstår.

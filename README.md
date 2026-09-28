# Byn vid fronten

Taktiskt infanterispel i realtid, sett rakt ovanifrån. Operation Morgonljus, en fransk by 1944.
Ren HTML, CSS och JavaScript med Canvas 2D. Inget byggsteg.

## Starta lokalt

```
npm start          # serverar dist/ på http://localhost:8080
```

Det går även att använda valfri statisk server mot `dist/`.

## Testa

```
npm test           # simuleringstester i Node (ingen webbläsare krävs)
```

## Publicering

Vercel-projektet serverar `dist/` direkt (se `vercel.json`). Varje push till `main` deployas.

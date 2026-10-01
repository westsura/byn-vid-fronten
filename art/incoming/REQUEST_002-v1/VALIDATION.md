# Egen kontroll – REQUEST_002

## Bildgranskning

De fyra specialistarken och de två arken med utslagna har granskats visuellt i bildvisaren. Alla visar rätt sida, två poser/varianter och genomskinlig bakgrund. DP:s magasin och tvåbensstöd har korrigerats i en separat omgång. Utslagnas kroppsskala och hjälmar har justerats separat; vapen ligger löst och armar/ben ger annan silhuett än skjutande liggande. Inget blod eller synliga skador.

Figurerna följer referensens målade rendering. Det finns kvar stiliserad sidoprojektion i en del vapendetaljer och liggande utrustning. Bedöm detta i spelvyn; det är inte en geometriskt exakt 3D-projektion. Hjälmdiametrarna är manuella uppskattningar med cirka ±7 källpixlars osäkerhet, inte automatiskt segmenterade mätningar.

## Maskinell kontroll

Bilddimensioner, RGBA-format, utsnittsgränser, genomskinliga marginaler vid alpha >= 32 och skala 28 px/enhet kontrolleras när paketet byggs. Svaga nästan transparenta kantrester kan kvarstå. PNG-original är kopierade utan pixelbearbetning.

registration-checks.json visar beräknade posförskjutningar utifrån angivna koordinater. Alla fyra passerar de angivna numeriska gränserna; SVT ligger nära gränsen för mynningsrörelse och bör särskilt granskas i spelet. Siffrorna har inte större noggrannhet än den manuella avläsningen.

Sovjetisk V4-gevärsskytt: efter korrigering är mynningsavvikelsen i sidled +0,214 respektive -0,071 enheter. Hjälmens relativa förflyttning är cirka0,214 enheter; mynningsförflyttningen är -0,107 framåt och -0,286 i sidled. Den anatomiska kompromissen för rotationspunkten beskrivs i TILL-CLAUDE.md.

Förhandsvisningens JavaScript syntaxkontrolleras. Ingen verifierad webbläsarbild eller provspelning ingår; kontrast och läsbarhet vid verklig normalzoom, rotation i motorn samt kulsprutelagets igenkänning vid4× återstår hos Claude/Björn. Paketet är inte slutgodkänt.

## Ursprung

Inbyggd imagegen med de bifogade V4- och hjälmreferenserna. Exakta prompter och iterationer ingår i PROMPTS-filerna. Ingen extern spelgrafik har lagts till.

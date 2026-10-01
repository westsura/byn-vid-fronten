# Kontroll

- Åtta rutor med samma mått och 28 px/enhet; fyra kolumner × två rader.
- Alla helt opaka pixlar i originalets redo-överkropp är pixelidentiska i samtliga rutor. Kontroll räknade 0 avvikande pixlar per ruta. Semitransparenta kantpixlar kan blandas med ben bakom.
- Pivot, hjälm och mynning har 0 avvikelse från redo i manifestet. Ingen separat omritning eller manuell skattning av dessa punkter behövs.
- Vänster/höger kontakt alternerar på 0/4. Passerlägen 2/6 är nära redo-silhuetten.
- Stödfotens kontaktpunkt är känd från placeringen av boot-lagret, även när den är skymd. Fotförflyttning mellan samplade stödpositioner är -98 pixlar. Kroppsförflyttningen vid samma steg är +98 pixlar.
- Rasterremsan vid 4× har visats och granskats. Första benplaceringen gav utstickande knän och justerades. Slutversionen har kompakta ben under den fasta överkroppen.
- Förhandsvisningens JavaScript har syntaxkontrollerats. Ingen verifierad webbläsaruppspelning eller provspelning har gjorts. Foot sliding mellan diskreta rutor, helgruppens rörelsekänsla och prestanda med 21 soldater är därför öppna granskningspunkter.
- Den diskreta cykeln kan glida mellan rutbyten vid kontinuerlig kroppsrörelse; se TILL-CLAUDE.md. Noll i samplad kontaktavvikelse är inte ett bevis på visuellt glidfri animation.
- Benens rasterkälla skapades med inbyggd imagegen. Atlas/markörer skapades som Canvas-animation med samma lager och geometri som mätvärdena. Inga nya rörelseregler har införts i spelet.

# Leveranskontroll

Utfört:

- Åtta manifestposter, gemensam pivot [600,390], 28 källpixlar/enhet och tre lager per ruta.
- De tre exporterade lagren återlästes och sammansattes. Resultatet är pixelidentiskt med motsvarande ruta i reservatlasen: 0 avvikande RGBA-kanaler i alla åtta rutor.
- Kontaktlägena klarar minst 4 enheters tå- och hälutstick enligt redovisad konturdefinition i measurements.json.
- Mynningens största sidoavvikelse 0,90993 enheter; längdavvikelse 0,05530. Hjälmcentrum 0. Värden beräknade från samma transformation som bilderna.
- Stödfotens markpunkt provades över sex stödperioder vid 0° och 45°, 800 prov per period, inklusive rutbyten och cykelbyte. Största restfel cirka 7,1e-15 enheter (numerisk avrundning).
- Sammansatt 4×-ark och ett extra ark vid slutet av varje rutintervall granskades visuellt. Benlager visas separat. Dold överlappning håller benens överkant under kroppen även efter förskjutning.
- preview.html:s JavaScript syntaxkontrollerat. Förhandsvisningen använder samma förskjutningsregel, men har inte körts i webbläsare i denna leveranskontroll.
- Källbilderna är oförändrade kopior av beställningens referenser. Ingen ny bildgenerering eller färgändring.

Kvar hos Claude/Björn:

- Faktisk fotglidning i spelmotorn, särskilt vid svängar och sidledsrörelse.
- Att stegen upplevs tydliga vid normalzoom i hel grupp; detta är en visuell spelbedömning, inte bevisat av utsticksmåtten.
- Övergång gång/redo/skott, terräng, prestanda och slutgodkännande.

Höftvinkeln anger benriggens fästpunktsrotation; det är inte en ny omritning av bäckenet i upper. Axlarna följer en rigid rotation av godkänd överkropp. Svängbenet har fortsatt åtta diskreta poser; bara stödfoten kompenseras kontinuerligt.

Detaljer och provpunkter finns i validation-results.json. Bygg- och kontrollfiler ligger i source/.

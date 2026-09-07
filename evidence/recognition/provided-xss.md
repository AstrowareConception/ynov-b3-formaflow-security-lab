# EVID-SEC-XSS-01 — interprétation HTML locale

- Contexte : bio synthétique vers sink client, 4 requêtes au maximum.
- Tag ou commit : `course-start-vulnerable` ; environnement : profil `vulnerable`, navigateur local.
- État initial : Alice synthétique et bio réinitialisée.
- Commande ou requête minimale : marqueur `<b data-proof="synthetic-xss">preuve locale</b>` sans script.
- Résultat attendu : création d’un élément HTML dans le vulnérable.
- Résultat observé : donnée conservée et présence du sink `innerHTML` vérifiées par Jest.
- Interprétation : une donnée non fiable atteint un contexte interprété.
- Cause ou hypothèse : cause confirmée, API de rendu inadaptée.
- Provenance : `provided` ; contributeur : `trainer-reference` ; contribution personnelle : exemple collectif à reproduire et expliquer.
- Confidentialité : `public` ; vérification : suite sécurité vulnérable ; résultat : `passed` le 2026-09-07.
- Limites : preuve sans JavaScript, aucun autre contexte couvert.
- Risque résiduel : encodages distincts à contrôler ailleurs.
- Reset : `npm run reset-data`, redémarrage, `npm run smoke`.

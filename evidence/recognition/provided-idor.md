# EVID-SEC-IDOR-01 — ownership absent

- Contexte : Alice demande l’unique commande synthétique de Bob, 2 requêtes.
- Tag ou commit : `course-start-vulnerable` ; environnement : JWT local expurgé.
- État initial : deux utilisateurs et deux commandes distinctes.
- Commande ou requête minimale : login Alice puis GET de l’identifiant Bob fourni.
- Résultat attendu : `200` vulnérable contenant le libellé Bob.
- Résultat observé : test passé, aucune énumération.
- Interprétation : authentification présente mais autorisation horizontale absente.
- Cause ou hypothèse : cause confirmée, sélection par ID seule.
- Provenance : `provided` ; contributeur : `trainer-reference` ; contribution personnelle : exemple fourni.
- Confidentialité : `public` ; vérification : suite sécurité vulnérable ; résultat : `passed` le 2026-09-07.
- Limites : une ressource et deux sujets fictifs.
- Risque résiduel : routes voisines à inventorier ; UUID imprévisible insuffisant.
- Reset : expurger le jeton, `npm run reset-data`, redémarrer, `npm run smoke`.

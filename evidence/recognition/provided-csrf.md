# EVID-SEC-CSRF-01 — credential cookie implicite

- Contexte : profil `cookie` isolé, 3 requêtes maximum, aucune page tierce.
- Tag ou commit : `course-start-vulnerable` ; environnement : API locale et cookie synthétique expurgé.
- État initial : Alice active, aucun cookie préalable.
- Commande ou requête minimale : login puis POST sensible sans token ni `Origin`.
- Résultat attendu : acceptation vulnérable ; Bearer sans en-tête refusé.
- Résultat observé : tests `cookie-profile.spec.ts` passés.
- Interprétation : le cookie est envoyé implicitement, le Bearer ne l’est pas.
- Cause ou hypothèse : cause confirmée, absence de preuve d’intention.
- Provenance : `provided` ; contributeur : `trainer-reference` ; contribution personnelle attendue : analyse individuelle distincte du socle fourni.
- Confidentialité : `public` ; vérification : `npm run test:security -- --profile cookie` ; résultat : `passed` le 2026-09-07.
- Limites : pas de site attaquant ni de navigateur tiers.
- Risque résiduel : XSS et compatibilité navigateur restent distincts.
- Reset : expurger le cookie, `npm run reset-data`, redémarrer, `npm run smoke`.

# EVID-SEC-SQLI-01 — structure SQL modifiable

- Contexte : recherche catalogue, preuve booléenne non destructive, 2 requêtes sur boucle locale.
- Tag ou commit : `course-start-vulnerable`.
- Environnement : Node 24.13.0, PostgreSQL 16.10, profil `vulnerable`.
- État initial : deux cours synthétiques, `npm run smoke` vert.
- Commande ou requête minimale : test `SQLi booléenne` de `tests/security/vulnerable-profile.spec.ts`.
- Résultat attendu : la variante élargit le résultat de 1 à 2 lignes.
- Résultat observé : test passé, aucune écriture.
- Interprétation : la valeur contrôlée modifie le prédicat SQL.
- Cause ou hypothèse : cause confirmée, concaténation dans l’adaptateur brut isolé.
- Provenance : `provided` ; contributeur : `trainer-reference` ; contribution personnelle : non applicable, exemple fourni.
- Confidentialité : `public`.
- Vérification : `npm run test:security -- --profile vulnerable`.
- Résultat de vérification : `passed` le 2026-09-07.
- Limites : une route et une preuve seulement.
- Risque résiduel : autres adaptateurs à relire.
- Reset : `npm run reset-data`, redémarrage explicite, `npm run smoke`.

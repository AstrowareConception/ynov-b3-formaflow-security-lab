# EVID-SEC-AUTH-01 — énumération et session faible

- Contexte : deux échecs de connexion synthétiques, sans brute force.
- Tag ou commit : `course-start-vulnerable` ; environnement : profil `vulnerable`.
- État initial : Alice présente, `absent@example.test` absent par fixture.
- Commande ou requête minimale : comparer exactement deux réponses `401`.
- Résultat attendu : messages distincts et JWT légitime sans expiration.
- Résultat observé : distinction de messages confirmée par Jest.
- Interprétation : l’API révèle l’existence du compte et ne borne pas la session.
- Cause ou hypothèse : causes confirmées dans `AuthService` et le schéma.
- Provenance : `provided` ; contributeur : `trainer-reference` ; contribution personnelle : exemple à relire.
- Confidentialité : `public` ; vérification : suite sécurité vulnérable ; résultat : `passed` le 2026-09-07.
- Limites : aucune mesure de résistance ni tentative massive.
- Risque résiduel : stockage, limite, rotation et révocation à traiter ensemble.
- Reset : `npm run reset-data`, redémarrer, `npm run smoke`.

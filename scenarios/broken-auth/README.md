# Authentification défaillante

- Objectif pédagogique : relier énumération, absence de limite, durée de session et stockage du secret.
- Profil requis : `npm run start:vulnerable`.
- URL autorisée : `http://127.0.0.1:3000/api/auth/login`.
- Comptes et fixtures : Alice synthétique et `absent@example.test` explicitement fictif.
- Préconditions : base réinitialisée ; aucune liste de mots de passe.
- Nombre maximal de requêtes : 6, sans parallélisme.
- Action minimale : comparer un compte absent et un mauvais mot de passe, puis constater l’absence d’expiration du JWT.
- Résultat attendu : messages distincts dans le vulnérable ; message stable, limite déterministe, expiration, rotation et révocation dans le corrigé.
- Preuve autorisée : statuts, messages, claims expurgés et compteur limité.
- Preuves interdites : brute force, dictionnaire, credential réel, token complet dans une capture.
- Cause : mot de passe en clair, message détaillé, aucune limite ni cycle de vie effectif de session.
- Correction : bcrypt coût 12, réponse uniforme, cinq échecs par minute, JWT 15 minutes, rotation de session et vérification de révocation.
- Tests positifs et négatifs : connexion légitime ; sixième échec `429` ; ancien jeton refusé après rotation/révocation ; hash vérifié.
- Commande de reset : arrêter les requêtes, conserver les seuls statuts, `npm run reset-data`, redémarrer, `npm run smoke`.
- Limites et risque résiduel : la limite locale pédagogique devrait être distribuée et supervisée en production.

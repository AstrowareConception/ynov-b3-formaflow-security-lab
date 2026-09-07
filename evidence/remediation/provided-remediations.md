# EVID-SEC-REMEDIATION-01 — mécanismes causaux corrigés

- Contexte : cinq familles du laboratoire, profils séparés, données `example.test`.
- Tag ou commit : `checkpoint-remediated`.
- Environnement : Node 24.13.0, NestJS 11.2.3, PostgreSQL 16.10, RabbitMQ 4.1.4, Nginx 1.27.5.
- État initial : fixtures recréées, profil explicite et smoke vert.
- Commande ou requête minimale : `npm run test:security -- --profile remediated`, `--profile cookie`, puis `npm run tls`.
- Résultat attendu : comportement légitime conservé ; SQL structuré, rendu texte, ownership/rôle, cycle de session et CSRF protégés.
- Résultat observé : suites locales passées ; bcrypt, AES-GCM, CSP et TLS vérifiés.
- Interprétation : chaque contrôle neutralise le mécanisme causal plutôt qu’une chaîne connue.
- Cause ou hypothèse : causes confirmées par contraste avec `course-start-vulnerable`.
- Provenance : `provided`.
- Contributeur : `trainer-reference`.
- Contribution personnelle : exemple fourni ; l’étudiant doit pouvoir relier un test à sa correction et défendre sa limite.
- Confidentialité : `public`.
- Vérification : typecheck, lint, build, Jest, profils Docker, PostgreSQL, RabbitMQ, TLS.
- Résultat de vérification : `passed` dans l’environnement décrit.
- Limites : pas de KMS, cluster, navigateur tiers, PKI publique ou charge réaliste.
- Risque résiduel : revue des routes voisines, observabilité et gestion distribuée des limites nécessaires en production.
- Reset : `npm run reset-data`, `npm run smoke`, puis `npm run stop` en fin d’atelier.

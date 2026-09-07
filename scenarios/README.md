# Scénarios bornés

Les cinq dossiers décrivent des preuves minimales exclusivement dirigées vers `http://127.0.0.1:3000`. Le garde-fou `scripts/target-guard.mjs` refuse toute cible extérieure. Aucun scan, brute force, payload destructif ou donnée réelle n’est autorisé.

Après chaque scénario : arrêter l’outil actif, conserver uniquement la preuve minimale expurgée, exécuter `npm run reset-data`, redémarrer explicitement le profil indiqué si nécessaire, puis `npm run smoke`.

| Dossier | Profil | Requêtes maximales |
|---|---|---:|
| `sql-injection/` | `vulnerable` | 3 |
| `xss/` | `vulnerable` | 4 |
| `csrf/` | `cookie` | 3 |
| `idor/` | `vulnerable` | 3 |
| `broken-auth/` | `vulnerable` | 6 |

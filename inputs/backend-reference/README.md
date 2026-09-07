# FormaFlow backend reference — entrée autonome Security Lab

Version : 1.0.0. Source : `ynov-b3-formaflow-distributed`, tag `reference-final`.

Copier ce dossier tel quel vers `ynov-b3-formaflow-security-lab/inputs/backend-reference/`, puis exécuter :

```text
python scripts/validate_handoff.py
```

Le paquet décrit la référence backend nécessaire au laboratoire : architecture, ownership, contrats, JWT local, autorisations, parcours, données synthétiques, surfaces, frontières de confiance, pannes et opérations. Il ne contient ni code évalué, ni production de binôme, ni solution au mini-projet, ni secret, ni donnée personnelle réelle.

`fixtures/reference-flow.json` simule contractuellement le résultat d'inscription utilisé dans les parcours finaux. Ce fichier indépendant n'est pas une implémentation de `enrollment-service`.

## Inventaire

- `architecture.md`, `ownership.yml` et `diagrams/` ;
- `contracts/openapi/`, `contracts/proto/` et `contracts/events/` ;
- `jwt-and-authorization.md`, `flows.md` et `identity-data-logs-messages.md` ;
- `collections/` et `fixtures/` ;
- `failure-scenarios.md`, `surfaces-and-trust.md` et `decisions-dependencies-risks.md` ;
- `OPERATIONS.md`, `VERSIONS.md`, `PROVENANCE.md` et `MANIFEST.sha256`.

Tous les services externes sont interdits. Les domaines `example.test`, identifiants `SYN-*` et valeurs `synthetic-*` rendent les fixtures manifestement fictives.

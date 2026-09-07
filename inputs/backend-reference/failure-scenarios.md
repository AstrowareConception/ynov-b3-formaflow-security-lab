# Scénarios de panne

| Scénario local | Résultat attendu | Preuve |
|---|---|---|
| simulateur lent | timeout explicite, circuit observable | code structuré et corrélation |
| simulateur 503 | retry uniquement si idempotent et borné | tentatives contrôlées |
| consommateur arrêté | messages conservés, producteur non bloqué par le consommateur | profondeur de file |
| broker indisponible après commit | outbox reste non publiée | ligne sans `published_at` |
| événement dupliqué | une seule notification | inbox et compteur duplicate |
| JSON invalide | aucun effet, DLQ augmente | log `dead_lettered` |
| panne après confirm | publication possiblement répétée | inbox absorbe le doublon |
| PostgreSQL indisponible | aucune transaction partielle | tables inchangées |

Toutes les fautes visent uniquement Compose, les simulateurs et les données synthétiques. Le rejeu DLQ est manuel après diagnostic.

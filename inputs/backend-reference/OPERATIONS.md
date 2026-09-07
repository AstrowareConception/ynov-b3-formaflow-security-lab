# Opérations locales

Dans le repository producteur :

```text
npm ci
npm run start
npm run smoke
npm run test:postgres
npm run test:rabbitmq
npm run stop
```

`npm run reset-data` supprime uniquement les volumes Compose `formaflow-distributed`, recrée bases et fixtures, puis attend les health checks. `npm run stop` cible uniquement ce projet.

Diagnostic : `docker compose -p formaflow-distributed -f compose.yml ps`, logs par service, `/health`, `/metrics`, `rabbitmqctl list_queues`, puis base possédée. Relever `correlationId`, dernière transaction locale et prochain traitement idempotent. Ne jamais copier un JWT complet dans une preuve.

Dans une copie isolée de ce handoff, seule la bibliothèque standard Python est nécessaire : `python scripts/validate_handoff.py`.

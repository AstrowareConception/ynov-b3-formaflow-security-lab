# Décisions, dépendances, risques et questions

## Décisions

- distribution progressive, jamais présentée comme amélioration automatique ;
- base logique par service et contrats minimaux ;
- REST externe, gRPC interne utile, RabbitMQ pour les faits asynchrones ;
- Kafka comparé sans seconde infrastructure ;
- JWT local fictif, autorisation dans le service propriétaire ;
- outbox/inbox et at-least-once, sans exactly-once global.

## Dépendances locales

Node/npm, Docker Compose, PostgreSQL, RabbitMQ et les fixtures de ce paquet. Aucun réseau public, paiement, identité, email, SMS ou cloud n'est requis.

## Risques résiduels

Secret JWT de démonstration connu, HTTP/AMQP sans TLS local, métriques en mémoire, relay simplifié, pas de migration industrielle, rate limit par processus et absence de politique de rétention production. Ces limites sont des entrées du threat modeling, pas des vulnérabilités à exploiter hors du laboratoire.

## Questions ouvertes pour Security Lab

- où terminer TLS et comment faire tourner les secrets en production ?
- quelles données minimiser, chiffrer ou purger selon finalité et durée ?
- comment centraliser audit et métriques sans journaliser de token ?
- quels contrôles différencier pour support et administrateur ?
- quelle politique d'accès et de rejeu appliquer à la DLQ ?

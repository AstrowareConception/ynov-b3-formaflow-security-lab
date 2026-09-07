# Architecture de référence

La gateway expose REST, vérifie le JWT local et applique le quota. Le service propriétaire répète l'autorisation métier. `catalog-service` expose la disponibilité interne en gRPC. `order-service` possède commandes, idempotency keys et outbox. `notification-service` consomme `OrderConfirmed.v1` avec inbox, retry borné et DLQ.

Le résultat `EnrollmentCreated.v1` utilisé par le laboratoire vient de `fixtures/reference-flow.json`, simulateur contractuel indépendant. Le SecureLab apporte ses propres profils vulnérable et corrigé ; aucun code de mini-projet n'est transmis.

Chaque service possède une base logique PostgreSQL. Aucune jointure, clé étrangère ou lecture inter-base n'est autorisée. RabbitMQ transporte des faits passés versionnés. La transaction locale n'englobe jamais le broker.

Les diagrammes joints couvrent contexte, conteneurs, ownership, REST, gRPC, événements, outbox, DLQ et corrélation. Les `.mmd` sont sources et les `.svg` leurs rendus imprimables.

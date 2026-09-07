# Parcours et flux

## Nominal

1. Le client synthétique crée une commande via REST avec JWT, `Idempotency-Key` et `X-Correlation-Id`.
2. Commande consulte la disponibilité Catalogue par gRPC et appelle le simulateur local de paiement.
3. La transaction `order_db` écrit commande, idempotence et outbox.
4. Le relay publie `OrderConfirmed.v1` avec publisher confirm.
5. Le simulateur contractuel joint représente `EnrollmentCreated.v1` sans code évalué.
6. Notification déduplique l'événement, écrit sa tentative puis ack.
7. Les consultations REST renvoient un état explicite et corrélé.

## Synchrone

REST est retenu à la frontière pour accessibilité Swagger/Postman. gRPC est retenu pour la disponibilité interne typée et sa deadline. Une erreur externe reste structurée ; une erreur gRPC n'est pas exposée brute.

## Asynchrone

Les événements sont des faits passés, minimaux, versionnés et corrélés. La livraison est at-least-once. Inbox et idempotence bornent les doubles effets ; aucune garantie exactly-once de bout en bout n'est annoncée.

# Cartographie identité, données, journaux et messages

| Élément | Identifiant synthétique | Stockage/transit | Journalisation | Rétention locale |
|---|---|---|---|---|
| compte client | `ACC-0001` | JWT, commande, événement | identifiant métier si nécessaire | reset Compose |
| apprenant | `LRN-0001` | ligne de commande, événement | exclu sauf diagnostic borné | reset Compose |
| email fictif | `learner.0001@example.test` | fixture Security Lab uniquement | masqué par défaut | fichier versionné synthétique |
| commande | `ORD-2027-000001` | `order_db`, outbox, événement | oui avec corrélation | reset Compose |
| inscription simulée | `ENR-2027-000001` | fixture contractuelle | oui dans scénario | fichier versionné synthétique |
| événement | UUID | RabbitMQ, inbox/outbox | `eventId`, type, tentative | files/DB locales |
| corrélation | chaîne <= 128 | REST, gRPC, événement | toujours | durée des logs locaux |
| JWT | bearer temporaire | header HTTP seulement | jamais | non persisté |

Les adresses et personnes sont manifestement fictives. Aucun export étudiant, capture personnelle ou donnée issue d'un tiers n'est inclus.

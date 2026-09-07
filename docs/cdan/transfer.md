# Transfert CDAN - Sécurité applicative et RGPD

> Kit : 1.0.0
> Identifiant : `TRF-SECURITY-RGPD-01`
> Module : `security-rgpd`
> Projet : `ynov-b3-formaflow-security-lab`
> Statut : `verified` - mise à jour : 2026-09-07

## Contexte

Le laboratoire local compare des profils explicitement faibles et corrigés avec des identités `example.test`. Le socle et les fixtures sont fournis ; la production attendue distingue analyse collective et contribution personnelle.

## Problème ou hypothèse

Une correction de contrôle d’accès suffit-elle si les DTO, événements, journaux et copies distribuées continuent d’exposer trop de données ?

## Décision ou conclusion

La remédiation associe autorisation serveur, minimisation contractuelle, redaction et propagation d’effacement. Les commandes soumises à conservation simulée sont limitées plutôt que supprimées sans discernement.

## Contribution personnelle

L’étudiant documente sa reproduction bornée, son analyse causale, le test ajouté et ses limites. La cartographie de référence et les fixtures sont des éléments fournis ; toute production de groupe est marquée `collective`.

## Outils et assistants

Node, Jest, Docker Compose et Mermaid sont utilisés localement. Le contributeur vérifie les commandes, expurge les jetons et ne conserve que le résultat minimal.

## Preuves sélectionnées

| ID | Type et emplacement | Affirmation | Vérification/résultat | Provenance/confidentialité |
|---|---|---|---|---|
| `EVID-SECURITY-RGPD-EXPORT-01` | test, `tests/privacy/privacy-by-design.spec.ts` | l’export ne contient que les données du sujet et aucun secret | `npm run test:privacy` ; assertion réussie | provided / public |
| `EVID-SECURITY-RGPD-FLOW-01` | diagramme, `docs/rgpd/erasure-propagation.mmd` | la demande minimale atteint le consommateur avant ack | `npm run diagrams` ; SVG frais | collective / public |

## Limites

Le test n’établit ni conformité juridique générale, ni purge réelle d’une sauvegarde, ni résilience multi-région. RabbitMQ et PostgreSQL restent locaux.

## Transfert vers le projet CDAN

Relier chaque constat à sa donnée, sa finalité, son propriétaire, sa durée, son test et son risque résiduel, sans exporter de donnée brute.

## Action suivante

Dans un projet autorisé, vérifier les bases légales et durées avec le responsable compétent puis automatiser la purge et le retest.

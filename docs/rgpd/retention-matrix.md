# Matrice de conservation

| Objet | Point de départ | Durée cible | Fin de durée | Exception/limite | Vérification |
|---|---|---|---|---|---|
| session | émission | 15 min | révocation puis purge sous 24 h | aucune prolongation implicite | test expiration/révocation |
| compte/profil | demande d’effacement ou clôture | 30 jours de clôture | pseudonymisation puis suppression des champs facultatifs | litige simulé documenté | test propagation |
| commande/paiement simulé | date de commande | 5 ans | anonymisation ou suppression | conservation légale simulée | revue annuelle |
| inscription | fin de session | 1 an | suppression ou anonymisation | preuve de formation simulée | requête de purge |
| préférence newsletter | retrait | arrêt immédiat ; preuve 3 ans | suppression de la preuve | preuve limitée à finalité/version/date | test retrait |
| notification | émission | 30 jours | suppression | aucune | test effacement distribué |
| journal d’audit | création | 30 jours | purge | gel de litige simulé, tracé | test redaction et tâche de purge |
| message RabbitMQ | publication | 24 h maximum | ack et éviction | dead-letter locale examinée puis purgée | test consommation |
| sauvegarde décrite | création | 30 jours glissants | destruction cryptographique/support | restauration rejoue les effacements | exercice de restauration documenté |
| statistique anonymisée | agrégation validée | 2 ans | purge | seulement si non ré-identifiable | revue du seuil d’agrégation |

La date de fin et l’exception doivent être enregistrées ; une conservation « au cas où » est interdite.

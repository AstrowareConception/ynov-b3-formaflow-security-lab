# Actifs

| Actif | Besoin principal | Impact d’une atteinte | Propriétaire opérationnel |
|---|---|---|---|
| Identité et session | confidentialité, authenticité | usurpation locale | API Gateway |
| Profil | confidentialité, intégrité | exposition ou altération | API Gateway |
| Commande et paiement simulé | intégrité, autorisation | accès horizontal, incohérence | API Gateway |
| Inscription | intégrité, disponibilité | perte de parcours | Enrollment Service |
| Catalogue | intégrité, disponibilité | décision faussée | API Gateway |
| Export et effacement | confidentialité, traçabilité | droit mal servi | coordination Gateway/Enrollment |
| Événement RabbitMQ | intégrité, minimisation | propagation erronée | producteur et consommateur |
| Journaux | confidentialité, intégrité | fuite de token ou preuve fausse | exploitation locale |
| Clé AES et secret JWT | confidentialité, rotation | déchiffrement ou jeton forgé | environnement local |

Les disponibilités attendues sont celles d’un atelier local ; elles ne justifient pas l’exposition réseau ou la conservation de données réelles.

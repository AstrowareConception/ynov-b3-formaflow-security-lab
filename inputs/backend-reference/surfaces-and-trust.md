# Surfaces exposées et frontières de confiance

| Surface | Exposition locale | Confiance et protection |
|---|---|---|
| gateway REST | `localhost:8080` | entrée non fiable, validation, JWT, quota, corrélation |
| Swagger services | ports locaux `/docs` | démonstration seulement, pas Internet |
| gRPC catalogue | réseau Compose | contrat Protobuf, deadline, métadonnée corrélation |
| AMQP | `localhost:5672` | credentials fictifs, schéma validé, ack explicite |
| Rabbit management | `localhost:15672` | opération locale, jamais exposée publiquement |
| PostgreSQL | `localhost:5432` | une base logique par propriétaire |
| logs et métriques | stdout, `/metrics` | pas de token, secret ni donnée réelle |

Frontières connues : client→gateway, gateway→service, service→base possédée, service→broker, broker→consommateur et opérateur→outillage local. TLS, rotation de secrets, IAM cloud, réseau de production et durcissement des images appartiennent au Security Lab ou à une cible de production, pas à cette référence locale.

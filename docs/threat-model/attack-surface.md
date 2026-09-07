# Surface d’attaque bornée

| Entrée | Confiance initiale | Contrôle attendu | Hypothèse pédagogique |
|---|---|---|---|
| `GET /api/catalog?q=` | non fiable | paramétrage SQL, longueur | injection SQL |
| `POST /api/profile/bio` | sujet authentifié, contenu non fiable | validation puis rendu texte | XSS stockée |
| `POST /cookie/account/delete` | cookie implicite | anti-CSRF, origine, réauthentification | CSRF |
| `GET /api/orders/{id}` | sujet authentifié, identifiant non fiable | ownership ou rôle | IDOR |
| `POST /api/auth/login` | anonyme | message uniforme, limite, bcrypt | auth défaillante |
| `GET /api/export` | sujet authentifié | scope sujet, DTO minimisé | export excessif |
| RabbitMQ topic | service local | schéma, version, minimisation | donnée excédentaire |
| PostgreSQL | rôle runtime | privilèges minimum, requêtes bornées | impact d’injection |

Ports publiés : `127.0.0.1:3000` pour l’interface/API et `127.0.0.1:15672` pour l’observation RabbitMQ. PostgreSQL et AMQP ne sont pas publiés. Les noms Docker ne sont admis que depuis le réseau du projet.

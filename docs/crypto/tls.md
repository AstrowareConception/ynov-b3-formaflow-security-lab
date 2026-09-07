# TLS local

`npm run tls` régénère une paire locale, vérifie SAN et correspondance clé/certificat, démarre Nginx sur `127.0.0.1:3443`, valide `/health` avec le certificat comme autorité explicite, puis vérifie la redirection `308` depuis `127.0.0.1:3080`.

Le certificat est auto-signé, valable 30 jours et limité à `localhost`, `127.0.0.1` et `::1`. Il ne prouve aucune identité publique. La clé et le certificat générés sont ignorés, ne doivent pas être archivés et sont remplacés à chaque génération. Les flux Nginx vers Gateway, Gateway vers PostgreSQL et AMQP restent non chiffrés dans le réseau Docker local ; ce choix réduit la complexité pédagogique mais ne représente pas une architecture de production.

HSTS n’est pas forcé sur l’hôte de développement afin de ne pas polluer durablement le navigateur. Une production demanderait chaîne de confiance, renouvellement automatisé, révocation, inventaire, alertes d’expiration et protection du flux interne selon son modèle de menace.

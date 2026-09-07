# TLS local

`npm run tls` génère une clé RSA et un certificat auto-signé de 30 jours avec SAN `localhost`, `127.0.0.1` et `::1`, vérifie leur correspondance, démarre Nginx 1.27.5 sur `127.0.0.1:3443`, puis contrôle HTTPS et la redirection `127.0.0.1:3080` en lui fournissant explicitement le certificat local comme autorité.

Les fichiers générés restent dans `infra/tls/generated/`, ignoré par Git. Cette PKI ne prouve aucune identité publique et ne doit jamais être distribuée ni utilisée en production. TLS se termine au proxy ; le flux interne `proxy -> api-remediated` reste HTTP dans le réseau Docker local et constitue une limite assumée du laboratoire. Rotation, révocation et protection matérielle de clé ne sont pas simulées.

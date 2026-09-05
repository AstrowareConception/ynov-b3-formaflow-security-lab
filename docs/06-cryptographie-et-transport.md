# Cryptographie et transport

## Propriété recherchée

- hachage de mot de passe : vérification sans déchiffrement ;
- chiffrement : confidentialité réversible avec gestion de clé ;
- signature/MAC : intégrité et authenticité selon le protocole ;
- TLS : confidentialité et intégrité du transport.

Ces mécanismes ne corrigent ni une IDOR, ni une injection, ni une mauvaise finalité RGPD.

## bcrypt

Les mots de passe sont traités par une bibliothèque éprouvée avec sel automatique et facteur de coût documenté. La stratégie prévoit évolution du coût et rehash progressif. Un pepper éventuel est stocké séparément et n'est pas indispensable au laboratoire.

## AES-GCM

La démonstration chiffre un champ personnel synthétique avec chiffrement authentifié, clé injectée hors Git et nonce unique. La décision documente rotation, séparation des environnements, sauvegardes, recherche impossible éventuelle et différence entre chiffrement, pseudonymisation et anonymisation.

## TLS local

Le reverse proxy termine HTTPS avec certificat local, redirection HTTP et configuration HSTS adaptée au contexte de démonstration. `make tls` régénère les éléments locaux et vérifie le parcours. Les flux interservices et les limites du point de terminaison sont explicités.

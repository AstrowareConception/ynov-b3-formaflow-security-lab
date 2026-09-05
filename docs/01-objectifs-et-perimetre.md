# Objectifs et périmètre

## Couverture obligatoire

Le repository couvre intégralement :

- injection SQL, XSS, CSRF, IDOR et authentification défaillante ;
- bcrypt, AES et TLS ;
- consentement, effacement, minimisation et registre ;
- audit applicatif élémentaire et rapport de remédiation.

## Principes pédagogiques

L'exploitation n'est pas une finalité. Elle sert à comprendre le mécanisme et à vérifier la correction. Une vulnérabilité n'est considérée comme traitée que si cause, correctif, test, risque résiduel et effets RGPD sont explicites.

## Non-objectifs

- scanner Internet ou une cible non autorisée ;
- rechercher le plus grand nombre de failles ;
- contourner un système réel ou conserver une persistance ;
- enseigner la sécurité réseau ou l'administration système en profondeur ;
- prétendre qu'AES, TLS ou un identifiant imprévisible corrigent une autorisation ;
- réduire le RGPD au consentement ou à la suppression d'un compte ;
- transformer les ateliers en seconde évaluation.

## Critère de sortie

Chaque constat relie actif, preuve, cause, impact technique/métier/RGPD, priorité, correction, test de vérification, risque résiduel et limite d'audit.

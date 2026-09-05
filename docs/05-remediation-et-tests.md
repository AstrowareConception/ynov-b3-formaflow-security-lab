# Remédiation et tests

## Démarche

Une remédiation suit cet ordre : reproduire, isoler la cause, choisir le contrôle au bon niveau, corriger, vérifier le cas légitime, vérifier que l'ancienne preuve échoue, rechercher une variante proche et documenter le risque résiduel.

## Contrat de preuve

Chaque preuve contient : scénario, version/tag, état initial, requête minimale, résultat observé, donnée expurgée, cause suspectée ou confirmée, commande de reset et limite.

## Tests positifs et négatifs

- positif : le comportement autorisé demeure possible ;
- négatif : l'exploitation ou l'accès interdit échoue avec un statut et un contrat stables ;
- non-régression : une variante pertinente ne contourne pas le correctif ;
- sécurité des données : le test ne dépend d'aucune donnée personnelle réelle.

## Correction du mécanisme

Une blacklist de payloads, un masquage d'interface, un changement d'identifiant ou une CSP seule ne suffisent pas lorsque la cause se situe respectivement dans SQL, l'autorisation, le contrôle serveur ou le rendu.

`make security-tests` exécute les scénarios bornés sur le profil attendu et échoue clairement si le mauvais profil est lancé.

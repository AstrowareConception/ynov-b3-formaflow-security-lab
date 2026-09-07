# JWT local et autorisations

Le JWT de démonstration est HS256, émis par `formaflow-local`, destiné à `formaflow-api`, valable au plus quinze minutes et marqué `synthetic: true`. Le secret de démonstration documenté est une valeur locale fictive à remplacer dans tout autre contexte. Aucun token signé n'est versionné.

Claims minimaux : `sub` sous forme `ACC-0001`, `roles` parmi `customer`, `support`, `admin`, `synthetic: true`, puis `iat` et `exp`. La gateway authentifie et transmet le token ; le service propriétaire autorise.

| Capacité | customer | support | admin |
|---|---:|---:|---:|
| créer sa commande | oui | non | oui |
| consulter sa commande | oui | support borné | oui |
| consulter sa future inscription | oui | support borné | oui |
| inspecter une DLQ | non | non | opération locale uniquement |

Un `customer` ne lit que les ressources dont `customerAccountId` correspond à `sub`. Les journaux ne contiennent jamais le header Authorization ni le token complet.

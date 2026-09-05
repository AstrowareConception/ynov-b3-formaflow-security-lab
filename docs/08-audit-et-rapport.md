# Audit et rapport de remédiation

## Cadrage

Le mini-audit commence par mandat, périmètre, durée, actifs, données, rôles, règles d'engagement, outils autorisés et limites. Il distingue observation, hypothèse, faiblesse confirmée, faux positif et absence de preuve.

## Constat actionnable

`reports/remediation.md` contient pour chaque constat :

- titre précis et composant ;
- préconditions et reproduction minimale ;
- résultat observé et attendu ;
- preuve expurgée ;
- cause racine ;
- impacts technique, métier et RGPD ;
- contrôles existants ou compensatoires ;
- recommandation et test de vérification ;
- priorité et justification ;
- risque résiduel ;
- limites de l'audit.

## Priorisation

La priorité combine vraisemblance, impact, exposition, données concernées, facilité d'exploitation, contrôles existants et coût de correction. Un score éventuel soutient le raisonnement mais ne remplace pas le contexte.

## Retest

Le rapport précise comment vérifier le correctif et comment s'assurer que le parcours légitime fonctionne encore. Une recommandation vague comme « sécuriser l'API » n'est pas actionnable.

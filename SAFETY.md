# Règles de sûreté du laboratoire

## Périmètre autorisé

Les manipulations actives sont limitées :

- aux conteneurs locaux du repository ;
- aux comptes et fixtures fournis ;
- aux scénarios précisément décrits dans `scenarios/` ;
- aux URL de boucle locale et aux noms internes Docker énumérés par le projet.

Tout autre système, domaine, adresse IP, compte ou donnée est hors périmètre. Aucun service tiers, site d’exercice public, AstroWare Conception ou accès Internet n’est une cible autorisée.

## Confinement

- les services vulnérables sont liés à l'interface locale par défaut ;
- `start-vulnerable` est une action explicite et distincte ;
- aucun port n'est exposé sur une machine distante ou un cloud ;
- les secrets, certificats et tokens sont factices ;
- aucun email, paiement ou webhook externe n'est envoyé ;
- OWASP ZAP reste passif ou limité à l'URL locale autorisée ;
- les scénarios n'exigent ni persistance ni exfiltration de données.

## Preuve minimale

La preuve s'arrête dès que l'hypothèse est confirmée. Elle évite altération inutile, automatisation agressive, brute force non borné et collecte excessive. Les journaux et captures sont expurgés des tokens et valeurs inutiles.

## Retour à l'état stable

Après chaque scénario : arrêter l'outil actif, conserver la preuve minimale, exécuter `make reset-data`, puis `make smoke`. En cas d'écart imprévu, arrêter le laboratoire et prévenir le formateur avant toute nouvelle tentative.

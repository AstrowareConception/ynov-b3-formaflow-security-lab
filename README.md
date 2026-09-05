# FormaFlow SecureLab — Sécurité applicative & RGPD

> Version documentaire : 0.1.0  
> Statut : spécification initiale, laboratoire non encore implémenté  
> Module : Sécurité applicative & RGPD — Bachelor 3 DEV  
> Volume : 14 heures — 7 h FFP + 7 h TDP

## Finalité du repository

`ynov-b3-formaflow-security-lab` est un laboratoire applicatif volontairement vulnérable, autonome, local et réinitialisable. Il permet de comprendre une faiblesse par une preuve contrôlée, d'en identifier la cause, de corriger le mécanisme, d'écrire un test de non-régression et d'expliciter le risque résiduel.

Le dépôt reprend le vocabulaire, les contrats et les flux de FormaFlow Distributed, mais jamais le code évalué d'un binôme. Il couvre authentification, catalogue, sessions, commandes, inscriptions, paiement simulé, notifications, exports, suppression de compte, journaux et événements RabbitMQ.

## Résultats pédagogiques attendus

À l'issue du module, l'étudiant doit pouvoir :

- distinguer actif, menace, vulnérabilité, exploitation, impact, risque et risque résiduel ;
- cartographier une surface d'attaque et des frontières de confiance ;
- expliquer, reproduire et corriger SQLi, XSS, CSRF, IDOR et authentification défaillante ;
- distinguer authentification et autorisation, contrôle client et décision serveur ;
- choisir entre hachage, chiffrement, signature et protection du transport ;
- justifier bcrypt, AES-GCM et TLS avec leurs limites ;
- identifier données personnelles, finalités, acteurs, bases légales et durées ;
- traduire minimisation, consentement, droits et effacement en exigences techniques ;
- produire cartographie, extrait de registre et backlog Privacy by Design ;
- rédiger un constat d'audit prouvé, priorisé et actionnable.

## Fil rouge

FormaFlow SecureLab expose une gateway NestJS, un service d'inscription, un client web local, PostgreSQL et RabbitMQ. Deux comptes fictifs permettent de tester les autorisations horizontales ; des profils didactiques activent des faiblesses précisément bornées.

Chaque scénario suit la chaîne :

1. périmètre et préconditions ;
2. observation et hypothèse ;
3. preuve minimale non destructive ;
4. cause racine ;
5. correction du mécanisme ;
6. test positif et test négatif ;
7. impact sur les données personnelles ;
8. risque résiduel et limite.

## Choix techniques

- NestJS et TypeScript ;
- PostgreSQL et adaptateur SQL brut réservé au scénario d'injection ;
- RabbitMQ ;
- Docker Compose ;
- Swagger/OpenAPI et collection Postman ou Bruno ;
- Jest/Supertest ;
- client web local minimal ;
- JWT Bearer pour le parcours principal ;
- profil cookie isolé pour le scénario CSRF ;
- terminaison TLS sur reverse proxy local ;
- bcrypt pour les mots de passe ;
- AES-GCM avec clé de démonstration injectée hors Git ;
- OWASP ZAP facultatif, passif ou strictement borné.

## Parcours des quatre séances

1. Cartographier l'exposition et comprendre les cinq vulnérabilités.
2. Exploiter de manière contrôlée, corriger et protéger les échanges.
3. Concevoir la sécurité et la conformité RGPD dans un système distribué.
4. Réaliser un mini-audit, prioriser la remédiation et passer le QCM formatif.

## Validation des acquis

Le syllabus indique que le module est **non évalué**. L'unique dispositif individuel est un QCM formatif non noté de 30 minutes en séance 4. Les preuves, correctifs, tests, cartographies et rapports produits en binôme donnent lieu à du feedback, mais à aucune note.

Le QCM, ses variantes et son corrigé restent dans un kit formateur privé.

## Arborescence cible

```text
ynov-b3-formaflow-security-lab/
├── README.md
├── CHANGELOG.md
├── manifest.yml
├── SAFETY.md
├── CHECKPOINTS.md
├── Makefile
├── compose.yml
├── .env.example
├── inputs/backend-reference/
├── apps/
│   ├── api-gateway/
│   ├── enrollment-service/
│   └── web-client/
├── packages/contracts/
├── infra/
├── scenarios/
├── tests/security/
├── docs/
│   ├── threat-model/
│   ├── crypto/
│   ├── rgpd/
│   └── cdan/transfer.md
├── evidence/
│   ├── recognition/
│   ├── remediation/
│   └── audit/
├── reports/remediation.md
└── handoff/audit-method-reference/
```

## Commandes contractuelles

| Commande | Effet attendu |
|---|---|
| `make setup` | Vérifier versions, dépendances, Docker et configuration locale |
| `make start-vulnerable` | Lancer explicitement le profil vulnérable sur l'hôte local |
| `make start-remediated` | Lancer le profil corrigé de référence |
| `make stop` | Arrêter uniquement les ressources du laboratoire |
| `make reset-data` | Restaurer les comptes et fixtures synthétiques |
| `make smoke` | Rejouer les parcours fonctionnels autorisés |
| `make test` | Exécuter les tests fonctionnels déterministes |
| `make security-tests` | Vérifier les scénarios de sécurité et non-régression |
| `make tls` | Générer les certificats locaux et vérifier HTTPS |
| `make quality` | Vérifier lint, types, tests et productions attendues |

## Branches, tags et checkpoints

- `course-start-vulnerable` ;
- `checkpoint-recognition` ;
- `checkpoint-remediated` ;
- `checkpoint-privacy` ;
- `reference-final`.

Les équipes travaillent dans `work/<team-id>`. Les checkpoints sont fournis ou consolidés par le formateur pour garantir une reprise équitable. Aucun tag de remise notée n'est créé.

## Entrée canonique

`inputs/backend-reference/` contient une copie en lecture seule de `ynov-b3-formaflow-distributed/handoff/security-reference/` : architecture, contrats OpenAPI et événements, JWT local, collection HTTP, flux, données synthétiques et limites connues.

Le laboratoire fournit lui-même code, comptes, certificats, fixtures, profils et scripts. Aucun dépôt étudiant antérieur n'est requis.

## Sortie canonique

`reference-final` fige corrections, tests, cartographies RGPD, constats types et limites. `handoff/audit-method-reference/` transmet uniquement la méthode et des exemples expurgés.

Le module Rétro-ingénierie & Audit de code repart ensuite d'AtlasLegacy au tag `audit-start`. Il n'existe aucune dépendance de code entre SecureLab et AtlasLegacy.

## Limites impératives

Seules les instances locales FormaFlow SecureLab et les parcours explicitement autorisés de Hack-Me.fr entrent dans le périmètre. Toute attaque, analyse active ou tentative d'accès visant un système réel, un service tiers ou le site d'AstroWare Conception est interdite.

Les preuves restent minimales, réversibles et expurgées. Les données, identités, clés, tokens et certificats sont fictifs.

## État de cette V1

Cette version fixe le contrat du laboratoire. Restent à produire : profils vulnérable/corrigé, scénarios, fixtures, certificats, tests, collections, scripts de reset, checkpoints réels, gabarits RGPD, kit QCM privé, référence finale et paquet méthodologique d'audit.

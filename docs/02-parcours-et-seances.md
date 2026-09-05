# Parcours et séances

## 1 — Cartographier et comprendre (4 h)

Apports : sécurité applicative, CIA, risques, HTTP, identité, frontières de confiance et mécanismes des cinq vulnérabilités.

Productions : démarrage du profil vulnérable, parcours avec deux comptes, inventaire des routes et données, `attack-surface.md`, cinq hypothèses et preuves minimales dans `evidence/recognition/`.

Sortie : `checkpoint-recognition` après débrief.

## 2 — Exploiter, corriger et protéger (3 h)

Apports : bcrypt, AES-GCM et TLS. Micro-ateliers SQLi, XSS, IDOR, puis CSRF/authentification.

Productions : pour chaque scénario, preuve, cause, correction, test positif, test négatif et limite dans `evidence/remediation/`, `tests/security/` et `docs/crypto/decisions.md`.

Sortie commune : `checkpoint-remediated` fourni par le formateur.

## 3 — Concevoir la conformité RGPD (4 h)

Apports : données personnelles, acteurs, traitements, finalités, bases légales, principes, droits, cycle de vie, Privacy by Design et Privacy by Default.

Productions : carte des données et flux, fiche de registre, backlog privacy, cinq exigences et deux tests automatisables.

Sortie : `checkpoint-privacy`.

## 4 — Auditer et valider les acquis (3 h)

Apports : mandat, périmètre, qualification, preuve, faux positif, risque résiduel et rapport actionnable.

Productions : mini-audit guidé non noté, preuve dans `evidence/audit/`, constat dans `reports/remediation.md` et fiche CDAN.

Un QCM individuel formatif non noté de 30 minutes clôt le module. Le formateur publie ensuite `reference-final`.

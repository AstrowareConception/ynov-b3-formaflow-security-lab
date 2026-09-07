# Procédures d’exercice des droits

Toutes les opérations concernent les fixtures `example.test` locales. L’identité est vérifiée par le Bearer courant ; aucun identifiant de tiers n’est accepté en paramètre.

## Accès et export

1. Réinitialiser les fixtures avec `npm run reset-data` sur un profil explicite.
2. Authentifier le compte synthétique puis appeler `GET /api/export` avec son Bearer.
3. Vérifier que profil, commandes et inscriptions appartiennent au sujet et qu’aucun hash, token, cookie ou journal interne n’est inclus.
4. Transmettre la réponse via HTTPS local ; ne pas la persister dans Git.

## Rectification

Appeler `POST /api/profile/rectification` avec `displayName` et `bio`. Le serveur prend l’identifiant dans le Bearer, borne les longueurs et ignore les champs non prévus. Les données de commande ne sont corrigées que sur justificatif simulé, sans réécrire une trace comptable.

## Opposition et retrait

La bio facultative peut être vidée et le traitement fondé sur l’intérêt légitime doit faire l’objet d’un examen documenté. La newsletter repose seule sur le consentement : `POST /api/preferences/newsletter` avec `granted=false` et `policyVersion=privacy-notice-2026-09` produit une preuve de retrait. L’accord utilise exactement la même route avec `true` ; le retrait est donc aussi simple que l’accord. Aucun refus n’empêche l’usage du compte.

Le consentement doit rester libre, spécifique, éclairé, univoque, versionné et prouvable. Il n’est jamais la base universelle des commandes, comptes ou obligations de sécurité.

## Effacement distribué

1. `DELETE /api/account` marque le compte, révoque la session et publie `account.deletion.requested.v1` avec le seul UUID.
2. Enrollment consomme l’événement, marque les inscriptions `erasure-requested`, supprime les notifications et retire les consentements encore actifs dans une transaction locale.
3. Les commandes restent isolées pendant leur durée légale simulée ; leur usage est limité et elles seront anonymisées à échéance.
4. Les journaux sont expurgés puis purgés à 30 jours. Une statistique ne subsiste que si son anonymisation est robuste.
5. Les sauvegardes glissantes expirent à 30 jours. Toute restauration doit rejouer les demandes d’effacement avant ouverture.
6. Conserver la preuve minimale, arrêter l’outil, exécuter `npm run reset-data`, puis `npm run smoke`.

## Limites

La suppression du compte n’équivaut pas à effacer immédiatement toute ligne. Obligations de conservation, contentieux simulé, disponibilité des consommateurs, messages en erreur et sauvegardes créent un délai et un risque résiduel. Une pseudonymisation reste réversible avec information additionnelle et demeure une donnée personnelle ; seule une anonymisation robuste et irréversible sort du champ. Le laboratoire ne simule ni autorité de contrôle ni sauvegarde de production.

# Catalogue des scénarios

## Injection SQL

Cause didactique : concaténation d'un paramètre dans un adaptateur PostgreSQL brut. Preuve booléenne ou temporelle bornée. Correction : requête paramétrée, validation des parties réellement dynamiques et privilèges DB limités. Test légitime obligatoire avec une apostrophe.

## XSS

Cause : donnée contrôlée atteignant un sink de rendu dangereux. La preuve est inoffensive et locale. Correction : API de rendu sûre ou encodage adapté au contexte ; sanitisation seulement si du HTML est requis ; CSP comme défense complémentaire.

## CSRF

Cause : action sensible authentifiée par cookie envoyé implicitement. Correction : token anti-CSRF, `SameSite`, contrôle d'origine et protection renforcée des opérations critiques. Le scénario appartient exclusivement au profil cookie.

## IDOR

Cause : chargement d'une ressource par identifiant sans contrôle d'appartenance. La preuve utilise deux comptes fictifs. Correction : autorisation serveur systématique. Un UUID imprévisible n'est pas une protection suffisante.

## Authentification défaillante

Scénarios bornés : énumération, tentatives non limitées, session non renouvelée ou stockage inadéquat. Correction : messages maîtrisés, limitation, renouvellement/expiration/révocation et bcrypt. Aucun brute force massif ni credential réel n'est employé.

Chaque dossier de scénario fixe URL locale, comptes, préconditions, nombre maximal de requêtes, résultat attendu, reset et preuves interdites.

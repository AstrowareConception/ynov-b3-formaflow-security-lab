# Injection SQL

- Objectif pédagogique : relier concaténation SQL, modification de la structure de requête et correction paramétrée.
- Profil requis : `npm run start:vulnerable`.
- URL autorisée : `http://127.0.0.1:3000/api/catalog` uniquement.
- Comptes et fixtures : catalogue synthétique, aucune authentification.
- Préconditions : smoke vert, base réinitialisée, cible contrôlée par `target-guard`.
- Nombre maximal de requêtes : 3.
- Action minimale : comparer `q=Sécurité` et la preuve booléenne non destructive encodée par le test Jest.
- Résultat attendu : la preuve vulnérable élargit la liste ; le profil corrigé conserve exactement la sémantique recherchée.
- Preuve autorisée : statuts, nombres de lignes et titres synthétiques.
- Preuves interdites : écriture, empilement de requêtes, temporisation, lecture système, fichier ou secret.
- Cause : interpolation de `term` dans `Database.vulnerableCatalogSearch`.
- Correction : placeholder PostgreSQL pour la valeur, liste blanche pour tout fragment SQL réellement dynamique et rôle DB sans administration.
- Tests positifs et négatifs : terme normal et apostrophe légitime ; preuve booléenne neutralisée ; variante proche traitée comme texte.
- Commande de reset : arrêter le client, garder le diff minimal, `npm run reset-data`, redémarrer le profil, `npm run smoke`.
- Limites et risque résiduel : le test ne couvre pas chaque requête de l’application ; une revue des autres adaptateurs reste requise.

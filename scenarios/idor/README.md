# IDOR / autorisation horizontale

- Objectif pédagogique : distinguer connaissance d’un identifiant et autorisation d’accès.
- Profil requis : `npm run start:vulnerable`.
- URL autorisée : `http://127.0.0.1:3000/api/orders/{id}`.
- Comptes et fixtures : Alice, Bob et Sacha Support, tous synthétiques ; deux commandes distinctes.
- Préconditions : jeton Alice local, identifiants fournis, smoke vert.
- Nombre maximal de requêtes : 3.
- Action minimale : lire la commande Alice puis remplacer l’identifiant par celui de Bob.
- Résultat attendu : faiblesse observée dans le profil vulnérable ; corrigé autorise propriétaire et Support, refuse l’autre apprenant avec `403` stable.
- Preuve autorisée : identifiant, statut et libellé synthétiques.
- Preuves interdites : énumération, génération d’UUID, collecte de plusieurs ressources, donnée réelle.
- Cause : requête par `id` sans prédicat d’ownership ni décision de rôle.
- Correction : autorisation serveur `owner_id = sub OR role = support` avant retour de la ressource.
- Tests positifs et négatifs : propriétaire `200`, autre apprenant `403`, Support `200`, identifiant absent `404`.
- Commande de reset : expurger les jetons, `npm run reset-data`, redémarrer, `npm run smoke`.
- Limites et risque résiduel : un UUID imprévisible ne constitue jamais une autorisation ; les routes voisines doivent être revues.

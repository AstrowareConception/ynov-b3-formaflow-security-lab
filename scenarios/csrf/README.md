# CSRF dans le profil cookie

- Objectif pédagogique : observer qu’un navigateur envoie implicitement un cookie, contrairement au Bearer principal.
- Profil requis : `npm run start:cookie` ; les routes sont refusées dans les autres profils.
- URL autorisée : `http://127.0.0.1:3000/cookie/vulnerable/login`, `http://127.0.0.1:3000/cookie/vulnerable/account/delete`, `http://127.0.0.1:3000/cookie/login` et `http://127.0.0.1:3000/cookie/account/delete` uniquement.
- Comptes et fixtures : Alice synthétique ; aucune page tierce.
- Préconditions : base réinitialisée, cookie issu du login local, aucune extension.
- Nombre maximal de requêtes : 3.
- Action minimale : login sur `/cookie/vulnerable/login`, puis POST d’effacement sur `/cookie/vulnerable/account/delete` sans token ni `Origin`; le contraste corrigé utilise `/cookie/login` puis `/cookie/account/delete`.
- Résultat attendu : variante vulnérable acceptée ; endpoint protégé refusé sans token/origine et accepté avec les deux plus réauthentification.
- Preuve autorisée : `Set-Cookie` expurgé aux attributs et statuts HTTP.
- Preuves interdites : site externe, iframe distante, collecte de cookie complet, attaque d’un navigateur tiers.
- Cause : credential implicite et absence de preuve d’intention.
- Correction : jeton anti-CSRF, origine locale, `SameSite=Strict`, `Secure`, `HttpOnly` et mot de passe récent pour l’effacement.
- Tests positifs et négatifs : flux protégé complet ; token absent, invalide ou mauvaise origine refusés ; Bearer avec cookie seul refusé.
- Commande de reset : fermer le client, expurger le cookie, `npm run reset-data`, redémarrer `cookie`, `npm run smoke`.
- Limites et risque résiduel : une XSS pourrait contourner plusieurs défenses navigateur ; elle reste un risque distinct.

# XSS stockée locale

- Objectif pédagogique : suivre une donnée contrôlée jusqu’au contexte de rendu du navigateur.
- Profil requis : `npm run start:vulnerable`.
- URL autorisée : `http://127.0.0.1:3000/` et ses routes `/api/profile`.
- Comptes et fixtures : `alice.learner@example.test`, mot de passe synthétique fourni dans l’interface.
- Préconditions : fenêtre locale, DevTools sans extension active, smoke vert.
- Nombre maximal de requêtes : 4.
- Action minimale : enregistrer `<b data-proof="synthetic-xss">preuve locale</b>` puis afficher la bio.
- Résultat attendu : le profil vulnérable crée un élément gras ; le corrigé affiche littéralement les caractères.
- Preuve autorisée : capture du marqueur inoffensif et inspection du nœud local.
- Preuves interdites : script, lecture de cookie/token, balise réseau, redirection, persistance hors fixture.
- Cause : affectation de la donnée à `innerHTML` alors qu’aucun HTML fonctionnel n’est requis.
- Correction : `textContent`; CSP restrictive comme défense complémentaire, jamais comme correction unique.
- Tests positifs et négatifs : texte accentué conservé ; balise affichée littéralement ; variante d’attribut non interprétée.
- Commande de reset : fermer DevTools, garder une capture expurgée, `npm run reset-data`, redémarrer, `npm run smoke`.
- Limites et risque résiduel : les autres contextes HTML, URL, CSS et JavaScript demanderaient des encodages adaptés.

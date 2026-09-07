# Matrice de minimisation

| Flux | Champs autorisés | Champs explicitement exclus | Contrôle automatisé |
|---|---|---|---|
| connexion | email, mot de passe en entrée ; jeton et expiration en sortie | hash, rôle interne non nécessaire, cookie | tests auth et redaction |
| profil | id, email, nom d’affichage, bio, newsletter | hash, mot de passe, session, journaux | `privacy-by-design.spec.ts` |
| rectification | nom d’affichage, bio | rôle, id cible, email arbitraire | sujet issu du Bearer et test DTO |
| export | profil minimal, commandes propres, inscriptions propres | hash, sessions, audit interne, données d’autrui | test export autorisé |
| préférence | booléen, finalité fixe, version de notice, dates | suivi marketing, adresse IP, appareil | test retrait versionné |
| inscription créée | enrollmentId, userId, courseId | email, nom, profil, paiement | schéma JSON fermé |
| effacement demandé | userId | email, nom, motif libre, jeton | schéma JSON fermé et test événement |
| journal | action, UUID pseudonyme, résultat, date | authorization, cookie, mot de passe, email complet | test redaction |

Ajouter un champ exige une finalité, une durée, un propriétaire et un test de non-régression. Un UUID imprévisible réduit la découverte fortuite mais ne remplace jamais l’autorisation.

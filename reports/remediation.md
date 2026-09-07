# Rapport de remédiation du laboratoire local

## Décision demandée

Adopter le profil `remediated` comme défaut, conserver `vulnerable` et `cookie` uniquement pour les démonstrations locales explicites, puis traiter les limites d’exploitation avant tout usage hors laboratoire. Les cinq causes didactiques sont corrigées et retestées ; aucune conclusion de conformité générale n’est formulée.

## Périmètre et méthode

- Cible : services Docker `formaflow-security-lab` sur boucle locale, données `example.test`.
- Versions : `course-start-vulnerable`, `checkpoint-recognition`, `checkpoint-remediated`, `checkpoint-privacy`.
- Intensité : scénarios bornés aux nombres de requêtes documentés, sans scan actif externe.
- Méthode : observation, hypothèse, preuve minimale, constat, correction causale, cas positif, cas négatif et non-régression.
- Hors périmètre : Internet, navigateur tiers, PKI publique, KMS, haute disponibilité, charge réelle et conseil juridique.

## Synthèse priorisée

| ID | Observation et hypothèse | Constat/cause confirmé | Impacts technique, métier et données | Priorité | Correction et vérification | Risque résiduel/limite |
|---|---|---|---|---|---|---|
| F-01 | une recherche locale retourne plus d’éléments que le terme ne justifie ; hypothèse de structure SQL influencée | concaténation dans l’unique adaptateur didactique | lecture élargie ; catalogue incohérent ; exposition potentielle si données personnelles | P0 | paramètre PostgreSQL, compte limité ; terme légitime avec apostrophe et variante refusée | fragments futurs à valider ; aucune écriture démontrée |
| F-02 | une bio synthétique devient du balisage ; hypothèse de sink interprétant | `innerHTML` dans le client faible | exécution dans l’origine locale ; altération interface ; accès possible aux données affichées | P0 | `textContent`, CSP complémentaire ; texte littéral et en-têtes testés | HTML riche non pris en charge ; une autre XSS resterait distincte |
| F-03 | Alice obtient une commande de Bob par identifiant ; hypothèse d’autorisation absente | chargement par ID sans ownership dans le profil faible | accès horizontal ; confusion support ; divulgation de commande synthétique | P0 | sujet ou rôle Support côté serveur ; propriétaire 200, autre 403, Support 200 | revue nécessaire pour toute nouvelle ressource ; UUID non assimilé à un contrôle |
| F-04 | réponses distinctes, sessions longues et essais non limités ; hypothèse de cycle auth incomplet | mot de passe clair didactique et session sans maîtrise | énumération, réutilisation ; usurpation métier ; exposition de profil | P0 | bcrypt 12, message uniforme, cinq refus puis 429, expiration 15 min, rotation/révocation | limite en mémoire non distribuée ; stratégie de coût à mesurer |
| F-05 | une opération cookie accepte l’envoi implicite ; hypothèse d’absence de preuve d’intention | route faible isolée sans anti-CSRF | action sensible involontaire ; suppression de compte ; propagation de données | P0 | token, origine, SameSite/HttpOnly/Secure et réauthentification ; cas manquant 403, complet accepté | une XSS pourrait contourner des défenses navigateur |
| F-06 | copies et événements peuvent survivre au compte ; hypothèse de cycle RGPD distribué incomplet | absence initiale de contrat de propagation complet | incohérences et sur-conservation | P1 | UUID minimal, transaction Enrollment, retrait et suppression ciblée ; test e2e | sauvegardes décrites mais non opérées, commandes retenues cinq ans simulés |

## Plan d’action

| Échéance | Responsable simulé | Action | Preuve de fin |
|---|---|---|---|
| immédiate | responsable API | interdire tout profil implicite faible et conserver les ports loopback | `npm start`, `docker compose config`, validateur central |
| immédiate | responsable sécurité | maintenir les tests corrigés et le contraste vulnérable borné | `npm run test:security -- --profile ...` |
| cycle suivant | responsable exploitation | externaliser limitation, secrets et certificats dans des services adaptés | décision d’architecture et test de panne |
| cycle suivant | responsables données | automatiser purges, restauration et rapprochement d’effacement | exercice documenté et métriques |
| avant production | responsable compétent | valider finalités, bases légales, durées et destinataires réels | registre approuvé et analyse de risques |

## Retest

Recréer les fixtures, lancer un profil explicite, exécuter smoke puis le cas métier autorisé, le cas interdit et une variante. Conserver la trace minimale, arrêter l’outil, exécuter `npm run reset-data`, `npm run smoke`, puis `npm run stop`. Un contrôle non exécutable est marqué `non exécuté` avec sa raison.

## Conclusion

Les preuves soutiennent la neutralisation des causes dans ce dépôt et cet environnement. Elles ne démontrent ni absence de faiblesse voisine, ni conformité RGPD d’une organisation réelle, ni sécurité d’un déploiement exposé.

# Exigences techniques Privacy by Design

| ID | Exigence | Critère vérifiable | Automatisation |
|---|---|---|---|
| PBD-01 | Tout export est lié au sujet authentifié côté serveur. | aucune donnée d’un autre UUID et aucun secret dans la réponse | oui, test automatisé `privacy-by-design.spec.ts` |
| PBD-02 | Les événements exposent le minimum contractuel. | schémas fermés et événement d’effacement limité à `userId` | oui, test automatisé et `validate-privacy.mjs` |
| PBD-03 | Les journaux expurgent autorisation, cookie et email complet. | valeurs remplacées avant persistance | oui, test automatisé de redaction |
| PBD-04 | La newsletter reste facultative, versionnée et retirable par la même route. | refus sans version ; choix booléen horodaté ; retrait immédiat | oui, test automatisé de retrait |
| PBD-05 | L’effacement se propage de manière bornée et idempotente. | compte marqué, session révoquée, notification supprimée, consentement retiré, inscription marquée | oui, test automatisé local et validation de source |
| PBD-06 | Rectification et DTO refusent les champs sans finalité. | seules `displayName` et `bio` alimentent la requête paramétrée | oui, test automatisé de minimisation |
| PBD-07 | Chaque catégorie possède une durée et une règle de fin. | matrice sans durée indéfinie et restauration rejouant les effacements | revue automatique de présence, exercice manuel |

Ces exigences sont des critères d’acceptation, pas des déclarations de conformité générale. Leur preuve est bornée au laboratoire local synthétique.

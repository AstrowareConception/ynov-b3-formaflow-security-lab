# Registre des traitements simulés

| Traitement | Responsable simulé | Finalité et nécessité | Catégories | Base légale | Destinataires | Conservation | Mesures | Droits et procédure |
|---|---|---|---|---|---|---|---|---|
| Gestion du compte | FormaFlow local | authentifier et fournir les fonctions demandées | identité synthétique, rôle, session | contrat pédagogique simulé | API Gateway | compte + 30 j | bcrypt coût 12, TLS local, session 15 min | `rights-procedures.md` sections accès, rectification, effacement |
| Commande et paiement simulé | FormaFlow local | démontrer le cycle métier sans donnée bancaire | montant, libellé, statut | contrat puis obligation de conservation simulée | support synthétique | 5 ans | ownership et rôle, export minimal | accès ; correction factuelle ; effacement limité et motivé |
| Inscription et notification | FormaFlow local | confirmer l’accès à une session | UUID compte/cours, statut, message local | contrat pédagogique simulé | Enrollment | 1 an / notification 30 j | contrat JSON fermé, RabbitMQ interne | accès, rectification, propagation d’effacement |
| Newsletter facultative | FormaFlow local | envoyer une préférence de contenu local | UUID, choix, version, dates | consentement | responsable communication | retrait + preuve 3 ans | choix séparé, horodaté, retrait identique | retrait immédiat via même API |
| Sécurité et audit | FormaFlow local | détecter un défaut et diagnostiquer | UUID sujet, action, horodatage, résultat | intérêt légitime borné | formateur autorisé | 30 j | redaction email/token/cookie, accès local | accès contextualisé, opposition examinée |
| Droits et export | FormaFlow local | répondre au sujet authentifié | données propres minimisées | obligation légale simulée | sujet uniquement | réponse non persistée ; trace 30 j | contrôle serveur, aucun paramètre d’autre sujet | accès, portabilité, rectification, effacement |

Avant tout usage réel, le responsable de traitement, les sous-traitants, transferts, durées légales et l’analyse d’impact doivent être réévalués. Le laboratoire ne vaut pas registre de production.

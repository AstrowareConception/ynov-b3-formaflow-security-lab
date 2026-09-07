# Backlog Privacy by Design

| Priorité | Exigence | Valeur/risque | Critères d’acceptation | État |
|---|---|---|---|---|
| P0 | PBD-01 autoriser l’export par sujet | empêche une divulgation inter-compte | cas propre 200, autre sujet impossible, secrets absents | vérifié |
| P0 | PBD-02 minimiser les événements | réduit la réplication et l’impact | schémas fermés, UUID seul pour effacement | vérifié |
| P0 | PBD-05 propager l’effacement | évite les copies orphelines | transaction Enrollment, ack après commit, retest local | vérifié |
| P1 | PBD-03 expurger les journaux | évite fuite de credentials | token/cookie masqués, email tronqué | vérifié |
| P1 | PBD-04 consentement facultatif | respecte liberté et retrait | même endpoint, notice versionnée, retrait horodaté | vérifié |
| P1 | PBD-06 rectification minimale | prévient mass assignment | champs métier explicites, sujet serveur | vérifié |
| P2 | PBD-07 purge temporelle | réduit le stock historique | tâches de purge et restauration à automatiser avant production | limite documentée |

La priorité combine impact données, vraisemblance locale et effort. Une exigence marquée vérifiée renvoie à un test ou contrat précis ; elle ne vaut pas conformité hors du périmètre.

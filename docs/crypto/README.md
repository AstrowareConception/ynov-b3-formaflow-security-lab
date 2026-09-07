# Cryptographie et transport

Les mécanismes répondent à des propriétés différentes :

| Mécanisme | Propriété | Usage du laboratoire | Ne corrige pas |
|---|---|---|---|
| Hachage bcrypt | vérification non réversible d’un secret | mot de passe synthétique | autorisation, injection |
| AES-256-GCM | confidentialité réversible + intégrité | champ personnel synthétique | anonymisation, finalité |
| Signature/MAC | authenticité et intégrité d’un message | signature JWT / tag GCM selon le protocole | confidentialité seule |
| TLS | confidentialité et intégrité en transit | navigateur vers proxy local | données au repos, contrôle métier |

Voir `decisions.md` et `tls.md`. Les tests déterministes injectent leur clé en mémoire ; aucune clé réelle ou réutilisable n’est suivie.

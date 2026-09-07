# Référence de méthode pour audit court

Paquet autonome destiné à un futur laboratoire inconnu. Il transmet une méthode de cadrage, qualification, preuve, priorisation et retest ; il ne transmet ni code applicatif, ni chaîne de démonstration, ni scénario SecureLab, ni liste de faiblesses à découvrir, ni constat sur un système consommateur.

## Parcours

1. Lire `PROVENANCE.md`, `VERSIONS.md` et `ETHICS.md`.
2. Cadrer l’autorisation et les limites avec `method/scope.md`.
3. Employer `method/vocabulary.md` puis `method/prioritization.md`.
4. Produire une preuve et un constat depuis `templates/`.
5. Retester avec `checklists/retest.md`.
6. Exécuter `python scripts/validate_handoff.py`.

Le manifeste utilise des chemins relatifs POSIX triés sur leur texte. Le validateur ne dépend que de la bibliothèque standard et ne contacte aucun réseau.

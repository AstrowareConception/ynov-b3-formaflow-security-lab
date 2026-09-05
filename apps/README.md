# Applications

- `api-gateway/` : routes, JWT, profil cookie, contrôle d'origine et exposition locale ;
- `enrollment-service/` : inscriptions, ownership, SQL didactique, export et suppression ;
- `web-client/` : contexts de rendu XSS et comportement navigateur/CSRF.

Chaque faiblesse doit être localisée, activable par profil et associée à un correctif de référence. Le code vulnérable porte un avertissement et ne doit jamais être réutilisé comme exemple de production.

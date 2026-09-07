# Frontières de confiance

1. Navigateur vers Gateway : toute entrée est non fiable ; le navigateur ne décide jamais l’autorisation.
2. Bearer vers identité : la signature ne suffit pas ; expiration, session et révocation sont vérifiées.
3. Cookie vers action sensible : l’authentification implicite exige une preuve d’intention séparée.
4. Gateway vers PostgreSQL : le rôle runtime limite l’impact ; le paramétrage protège la structure SQL.
5. Gateway vers RabbitMQ : seuls les identifiants nécessaires traversent la frontière.
6. RabbitMQ vers Enrollment : le consommateur valide version et forme avant effet local.
7. Reverse proxy TLS vers Gateway : TLS se termine au proxy ; le flux interne HTTP local reste une limite documentée.
8. Environnement vers crypto : clés injectées, jamais journalisées ni suivies.

Un UUID, une signature JWT, un réseau Docker ou une CSP ne remplace pas la décision correspondant à la frontière.

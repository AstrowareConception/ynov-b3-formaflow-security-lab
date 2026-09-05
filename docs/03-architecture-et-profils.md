# Architecture et profils

## Composants

`api-gateway` expose les routes et porte authentification commune. `enrollment-service` possède les inscriptions et données associées. `web-client` matérialise les contextes de rendu et le comportement du navigateur. PostgreSQL et RabbitMQ permettent d'étudier données, événements, journaux et droits distribués.

## Profil vulnérable

Lancé uniquement par `make start-vulnerable`, il active des variantes explicitement déclarées. Les services écoutent localement et affichent un avertissement visible. Les vulnérabilités sont indépendantes autant que possible afin qu'une preuve ne détruise pas les conditions d'une autre.

## Profil corrigé

`make start-remediated` active les implémentations de référence et les tests de non-régression. Il ne doit pas simplement filtrer les payloads connus : le mécanisme causal est corrigé.

## Profil cookie CSRF

Le parcours principal utilise JWT Bearer. Un profil cookie séparé démontre l'envoi implicite des credentials par le navigateur, puis jeton anti-CSRF, `SameSite`, contrôle d'origine et réauthentification éventuelle. Cette variante ne modifie pas artificiellement toute l'architecture.

## Configuration

Les profils, ports et secrets factices sont documentés dans `.env.example`. La clé AES n'est jamais committée. Le reverse proxy local termine TLS et les certificats sont régénérables.

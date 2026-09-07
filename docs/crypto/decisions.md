# Décisions bcrypt et AES-GCM

## Bcrypt

Le profil corrigé emploie `bcrypt` 6.0.0 avec coût 12. La bibliothèque génère et encode le sel. Deux hachages du même mot de passe diffèrent et restent vérifiables, ce que démontre `tests/unit/crypto.spec.ts`. Un hash factice de coût identique réduit la différence temporelle entre compte absent et mot de passe faux.

À la connexion, `getRounds` compare le coût stocké au coût courant ; un hash plus faible est recalculé après authentification réussie. Une évolution de coût doit être mesurée sur l’infrastructure cible, déployée progressivement, observée et réversible. Le mot de passe en clair n’existe que dans le profil volontairement vulnérable ; au démarrage corrigé, la colonne didactique est vidée.

## AES-256-GCM

`packages/security/src/crypto.ts` chiffre une bio synthétique avec une clé 256 bits injectée par `AES_GCM_KEY_BASE64`, un nonce aléatoire unique de 96 bits, une donnée associée versionnée et un tag d’authentification. L’enveloppe `v1` contient seulement version, nonce, tag et ciphertext. Les tests couvrent deux nonces différents, l’aller-retour et le refus d’une altération.

En production, une clé résiderait dans un gestionnaire de secrets séparé par environnement et usage. Sa rotation exige un identifiant de clé, une période de lecture multi-version, un rechiffrement suivi et une procédure de restauration. Les sauvegardes chiffrées et leurs clés ont des cycles séparés ; perdre la clé rend la donnée irrécupérable, la copier avec la sauvegarde annule une partie du bénéfice.

Le chiffrement limite la lecture du stockage mais rend recherche, indexation et déduplication difficiles. Un index dérivé demanderait une décision et une clé distinctes. Le chiffrement est réversible : il ne constitue ni anonymisation, ni effacement. Il peut participer à une pseudonymisation si les informations de réidentification sont séparées ; une anonymisation suppose un risque de réidentification raisonnablement écarté dans le contexte.

## Limites communes

Ces démonstrations ne couvrent ni HSM/KMS, ni rotation distribuée en ligne, ni sauvegarde réelle, ni compromission du processus après déchiffrement. La cryptographie ne justifie jamais une collecte excessive ou une conservation sans finalité.

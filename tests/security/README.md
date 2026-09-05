# Tests de sécurité

Les tests couvriront : requêtes SQL paramétrées ; rendu contextualisé ; protections CSRF du profil cookie ; autorisations horizontales/verticales ; limitation et renouvellement de session ; bcrypt ; AES-GCM ; HTTPS local ; minimisation des DTO/événements/logs ; export et effacement distribués.

Chaque correction possède au moins un cas légitime et un cas interdit. `make security-tests` vérifie le profil actif, borne les délais et ne contacte aucun service extérieur.

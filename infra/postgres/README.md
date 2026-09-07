# PostgreSQL local

PostgreSQL 16.10 contient uniquement les fixtures `example.test` et identifiants préfixés par des UUID réservés au laboratoire. Le rôle `formaflow_runtime` ne possède ni privilège d'administration, ni création de rôle ou base. `npm run reset-data` recrée exclusivement le volume du projet Compose `formaflow-security-lab`.

CREATE ROLE formaflow_runtime LOGIN PASSWORD 'synthetic-runtime-password' NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;

CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  bio text NOT NULL DEFAULT '',
  role text NOT NULL CHECK (role IN ('learner', 'support')),
  password_plain text,
  password_hash text,
  newsletter boolean NOT NULL DEFAULT false,
  deleted_at timestamptz
);
CREATE TABLE sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  token_id uuid NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);
CREATE TABLE catalog (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL
);
CREATE TABLE orders (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES users(id),
  label text NOT NULL,
  amount_cents integer NOT NULL,
  payment_status text NOT NULL
);
CREATE TABLE enrollments (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  course_id uuid NOT NULL,
  status text NOT NULL
);
CREATE TABLE notifications (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  channel text NOT NULL,
  message text NOT NULL
);
CREATE TABLE consents (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  purpose text NOT NULL,
  policy_version text NOT NULL,
  granted_at timestamptz,
  withdrawn_at timestamptz
);
CREATE TABLE audit_logs (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL,
  subject_id uuid,
  details jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO users VALUES
('10000000-0000-4000-8000-000000000001','alice.learner@example.test','Alice Synthétique','Profil local Alice','learner','Synthetic-Alice-2026!',NULL,true,NULL),
('10000000-0000-4000-8000-000000000002','bob.learner@example.test','Bob Synthétique','Profil local Bob','learner','Synthetic-Bob-2026!',NULL,false,NULL),
('10000000-0000-4000-8000-000000000003','sacha.support@example.test','Sacha Support','Support synthétique','support','Synthetic-Support-2026!',NULL,false,NULL);
INSERT INTO catalog VALUES
('20000000-0000-4000-8000-000000000001','Sécurité applicative','Atelier local contrôlé'),
('20000000-0000-4000-8000-000000000002','L''architecture sûre','Valeur légitime avec apostrophe');
INSERT INTO orders VALUES
('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Commande synthétique Alice',4200,'simulated-paid'),
('30000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','Commande synthétique Bob',3500,'simulated-pending');
INSERT INTO enrollments VALUES
('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','confirmed');
INSERT INTO notifications VALUES
('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','local','Inscription synthétique confirmée');

GRANT CONNECT ON DATABASE formaflow TO formaflow_runtime;
GRANT USAGE ON SCHEMA public TO formaflow_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON users, sessions, catalog, orders, enrollments, notifications, consents, audit_logs TO formaflow_runtime;
GRANT USAGE, SELECT ON SEQUENCE audit_logs_id_seq TO formaflow_runtime;

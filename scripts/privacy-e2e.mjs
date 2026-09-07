import { execFileSync } from 'node:child_process';
import { assertLocalTarget } from './target-guard.mjs';

const base = process.env.LAB_BASE_URL ?? 'http://127.0.0.1:3000';
assertLocalTarget(base);
const signal = () => AbortSignal.timeout(5_000);
const jsonRequest = (path, options = {}) => fetch(`${base}${path}`, { ...options, signal: signal() });

const login = await jsonRequest('/api/auth/login', {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'alice.learner@example.test', password: 'Synthetic-Alice-2026!' }),
});
if (login.status !== 200) throw new Error(`Connexion synthétique refusée: ${login.status}`);
const { accessToken } = await login.json();
const headers = { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' };

const exported = await jsonRequest('/api/export', { headers });
if (exported.status !== 200) throw new Error(`Export propre refusé: ${exported.status}`);
const serialized = JSON.stringify(await exported.json());
if (!serialized.includes('alice.learner@example.test') || /password|token|session/i.test(serialized)) throw new Error('Export non minimal');

for (const granted of [true, false]) {
  const preference = await jsonRequest('/api/preferences/newsletter', {
    method: 'POST', headers, body: JSON.stringify({ granted, policyVersion: 'privacy-notice-2026-09' }),
  });
  if (preference.status !== 201) throw new Error(`Préférence ${granted} refusée: ${preference.status}`);
}

const deletion = await jsonRequest('/api/account', { method: 'DELETE', headers });
if (deletion.status !== 200) throw new Error(`Effacement refusé: ${deletion.status}`);

const sql = "SELECT COALESCE((SELECT status FROM enrollments WHERE user_id='10000000-0000-4000-8000-000000000001' LIMIT 1),'none') || ':' || (SELECT count(*) FROM notifications WHERE user_id='10000000-0000-4000-8000-000000000001') || ':' || (SELECT count(*) FROM consents WHERE user_id='10000000-0000-4000-8000-000000000001' AND withdrawn_at IS NULL) || ':' || (SELECT count(*) FROM orders WHERE owner_id='10000000-0000-4000-8000-000000000001')";
let state = '';
for (let attempt = 0; attempt < 20; attempt += 1) {
  state = execFileSync('docker', [
    'compose', '-f', 'compose.yml', '-p', 'formaflow-security-lab',
    'exec', '-T', 'postgres', 'psql', '-U', 'formaflow_admin', '-d', 'formaflow', '-tAc', sql,
  ], { encoding: 'utf8', timeout: 5_000 }).trim();
  if (state === 'erasure-requested:0:0:1') break;
  await new Promise((resolve) => setTimeout(resolve, 250));
}
if (state !== 'erasure-requested:0:0:1') throw new Error(`Propagation incomplète: ${state}`);
console.log('OK privacy-e2e export=minimal consent=withdrawn erasure=propagated retained-orders=1 target=local');

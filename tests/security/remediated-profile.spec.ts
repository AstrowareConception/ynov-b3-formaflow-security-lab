const active = process.env.LAB_PROFILE_TEST === 'remediated';
const describeRemediated = active ? describe : describe.skip;
const base = process.env.LAB_BASE_URL ?? 'http://127.0.0.1:3000';
const signal = () => AbortSignal.timeout(6_000);

async function login(email: string, password: string) {
  const response = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }), signal: signal() });
  return { response, body: await response.json() as { accessToken?: string; message?: string; expiresIn?: number } };
}

describeRemediated('profil remédié', () => {
  test('la recherche est paramétrée et conserve l’apostrophe légitime', async () => {
    const attack = await fetch(`${base}/api/catalog?q=${encodeURIComponent("x%' OR '1'='1' -- ")}`, { signal: signal() }).then((r) => r.json()) as unknown[];
    const apostrophe = await fetch(`${base}/api/catalog?q=${encodeURIComponent("L'architecture")}`, { signal: signal() }).then((r) => r.json()) as unknown[];
    expect(attack).toHaveLength(0);
    expect(apostrophe).toHaveLength(1);
  });

  test('ownership refuse Bob à Alice, conserve propriétaire et rôle Support', async () => {
    const alice = await login('alice.learner@example.test', 'Synthetic-Alice-2026!');
    const own = await fetch(`${base}/api/orders/30000000-0000-4000-8000-000000000001`, { headers: { authorization: `Bearer ${alice.body.accessToken}` }, signal: signal() });
    const other = await fetch(`${base}/api/orders/30000000-0000-4000-8000-000000000002`, { headers: { authorization: `Bearer ${alice.body.accessToken}` }, signal: signal() });
    const support = await login('sacha.support@example.test', 'Synthetic-Support-2026!');
    const allowed = await fetch(`${base}/api/orders/30000000-0000-4000-8000-000000000002`, { headers: { authorization: `Bearer ${support.body.accessToken}` }, signal: signal() });
    expect(own.status).toBe(200);
    expect(other.status).toBe(403);
    expect(allowed.status).toBe(200);
  });

  test('le rendu corrigé est textuel et la CSP reste complémentaire', async () => {
    const response = await fetch(`${base}/app.js`, { signal: signal() });
    const script = await response.text();
    expect(script).toContain('textContent=data.bio');
    expect(script).not.toContain('innerHTML');
    expect(response.headers.get('content-security-policy')).toBeTruthy();
  });

  test('une nouvelle connexion révoque la session précédente', async () => {
    const first = await login('bob.learner@example.test', 'Synthetic-Bob-2026!');
    const second = await login('bob.learner@example.test', 'Synthetic-Bob-2026!');
    expect(second.body.expiresIn).toBe(900);
    const revoked = await fetch(`${base}/api/profile`, { headers: { authorization: `Bearer ${first.body.accessToken}` }, signal: signal() });
    const current = await fetch(`${base}/api/profile`, { headers: { authorization: `Bearer ${second.body.accessToken}` }, signal: signal() });
    expect(revoked.status).toBe(401);
    expect(current.status).toBe(200);
  });

  test('les messages sont uniformes et la sixième tentative est limitée', async () => {
    const absent = await login('absent@example.test', 'Synthetic-Invalid-2026!');
    const wrong = await login('alice.learner@example.test', 'Synthetic-Invalid-2026!');
    expect(absent.response.status).toBe(401);
    expect(wrong.response.status).toBe(401);
    expect(absent.body.message).toBe(wrong.body.message);
    const boundedIdentity = `bounded-${process.pid}@example.test`;
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      statuses.push((await login(boundedIdentity, 'Synthetic-Invalid-2026!')).response.status);
    }
    expect(statuses).toEqual([401, 401, 401, 401, 401, 429]);
  });

  test('les fixtures et requêtes sont explicitement synthétiques', () => {
    expect(['alice.learner@example.test', 'bob.learner@example.test'].every((email) => /@example\.test$/.test(email))).toBe(true);
  });
});

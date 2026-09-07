const active = process.env.LAB_PROFILE_TEST === 'cookie';
const describeCookie = active ? describe : describe.skip;
const base = process.env.LAB_BASE_URL ?? 'http://127.0.0.1:3000';

describeCookie('preuve CSRF exclusivement dans le profil cookie', () => {
  test('le cookie implicite suffit à l’action sensible vulnérable', async () => {
    const login = await fetch(`${base}/cookie/vulnerable/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'bob.learner@example.test', password: 'Synthetic-Bob-2026!' }),
      signal: AbortSignal.timeout(5_000),
    });
    expect(login.status).toBe(200);
    const cookie = login.headers.get('set-cookie');
    expect(cookie).toContain('lab_session=');
    const deletion = await fetch(`${base}/cookie/vulnerable/account/delete`, {
      method: 'POST', headers: { cookie: cookie! }, signal: AbortSignal.timeout(5_000),
    });
    expect(deletion.status).toBe(201);
    expect(await deletion.json()).toEqual({ accepted: true, csrfProtection: false });
  });
  test('le flux corrigé exige token, origine, attributs sûrs et réauthentification', async () => {
    const login = await fetch(`${base}/cookie/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'alice.learner@example.test', password: 'Synthetic-Alice-2026!' }),
      signal: AbortSignal.timeout(5_000),
    });
    const body = await login.json() as { csrfToken: string };
    const cookie = login.headers.get('set-cookie')!;
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/Secure/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
    const missing = await fetch(`${base}/cookie/account/delete`, { method: 'POST', headers: { cookie, 'content-type': 'application/json' }, body: JSON.stringify({ password: 'Synthetic-Alice-2026!' }), signal: AbortSignal.timeout(5_000) });
    expect(missing.status).toBe(403);
    const accepted = await fetch(`${base}/cookie/account/delete`, {
      method: 'POST', headers: { cookie, origin: 'http://127.0.0.1:3000', 'x-csrf-token': body.csrfToken, 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'Synthetic-Alice-2026!' }), signal: AbortSignal.timeout(5_000),
    });
    expect(accepted.status).toBe(201);
    expect(await accepted.json()).toEqual({ accepted: true, csrfProtection: true });
  });
  test('le parcours Bearer principal ne traite pas le cookie comme une authentification', async () => {
    const response = await fetch(`${base}/api/account`, { method: 'DELETE', headers: { cookie: 'lab_session=synthetic-invalid' }, signal: AbortSignal.timeout(5_000) });
    expect(response.status).toBe(401);
  });
});

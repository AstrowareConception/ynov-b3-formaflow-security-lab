import { readFileSync } from 'node:fs';
import type { Request } from 'express';
import { AppController } from '../../apps/api-gateway/src/app.controller';
import type { AuthService } from '../../apps/api-gateway/src/auth.service';
import type { Database } from '../../apps/api-gateway/src/database';
import type { EventBus } from '../../apps/api-gateway/src/event-bus';
import { redactLog } from '../../packages/security/src/redaction';

const aliceId = '10000000-0000-4000-8000-000000000001';
const request = { headers: { authorization: 'Bearer synthetic-local-token' } } as Request;

function harness(queryImplementation: (sql: string, values?: unknown[]) => Promise<unknown>) {
  const query = jest.fn(queryImplementation);
  const verify = jest.fn(async () => ({ sub: aliceId, role: 'learner' as const, sid: 'synthetic-session' }));
  const publish = jest.fn(async (_type: string, data: Record<string, unknown>) => ({ data }));
  const controller = new AppController(
    { query } as unknown as Database,
    { verify, revoke: jest.fn(async () => undefined) } as unknown as AuthService,
    { publish } as unknown as EventBus,
  );
  return { controller, query, publish };
}

describe('exigences RGPD automatisées', () => {
  test('l’export est limité au sujet et exclut les secrets techniques', async () => {
    const { controller, query } = harness(async (sql) => {
      if (sql.includes('FROM users')) return { rows: [{ id: aliceId, email: 'alice.learner@example.test', display_name: 'Alice Synthétique', bio: '', newsletter: false }] };
      if (sql.includes('FROM orders')) return { rows: [{ id: '30000000-0000-4000-8000-000000000001', label: 'Commande synthétique', amount_cents: 4200, payment_status: 'simulated-paid' }] };
      return { rows: [{ id: '40000000-0000-4000-8000-000000000001', course_id: '20000000-0000-4000-8000-000000000001', status: 'confirmed' }] };
    });

    const exported = await controller.exportData(request) as Record<string, unknown>;

    expect(query.mock.calls.every((call) => call[1]?.[0] === aliceId)).toBe(true);
    expect(JSON.stringify(exported)).not.toMatch(/password|token|session/i);
  });

  test('la rectification ignore les champs non prévus et reste bornée', async () => {
    const { controller, query } = harness(async () => ({ rows: [{ id: aliceId, display_name: 'Alice Rectifiée', bio: 'Bio synthétique' }] }));
    const result = await controller.rectify(request, {
      displayName: 'Alice Rectifiée', bio: 'Bio synthétique', trackingId: 'ignored',
    } as { displayName: string; bio: string });

    expect(result).toMatchObject({ id: aliceId, display_name: 'Alice Rectifiée' });
    expect(query.mock.calls[0]?.[1]).toEqual(['Alice Rectifiée', 'Bio synthétique', aliceId]);
  });

  test('le retrait facultatif est versionné et aussi direct que l’accord', async () => {
    const { controller, query } = harness(async () => ({ rows: [], rowCount: 1 }));
    const result = await controller.newsletter(request, { granted: false, policyVersion: 'privacy-notice-2026-09' });

    expect(result).toEqual({ purpose: 'optional-newsletter', granted: false, policyVersion: 'privacy-notice-2026-09' });
    expect(query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users SET newsletter'), [false, aliceId]);
    const insert = query.mock.calls.find((call) => call[0].startsWith('INSERT INTO consents'));
    expect(insert?.[1]?.[5]).toBeInstanceOf(Date);
  });

  test('la demande d’effacement publie uniquement l’identifiant technique nécessaire', async () => {
    const { controller, publish } = harness(async () => ({ rows: [], rowCount: 1 }));
    await controller.deleteAccount(request);
    expect(publish).toHaveBeenCalledWith('account.deletion.requested.v1', { userId: aliceId });
  });

  test('les contrats d’événements refusent les propriétés superflues', () => {
    for (const name of ['account-deletion-requested.v1', 'enrollment-created.v1']) {
      const schema = JSON.parse(readFileSync(`packages/contracts/events/${name}.schema.json`, 'utf8')) as { additionalProperties: boolean; properties: { data: { additionalProperties: boolean } } };
      expect(schema.additionalProperties).toBe(false);
      expect(schema.properties.data.additionalProperties).toBe(false);
    }
  });

  test('les journaux expurgent secrets, cookies et autorisations', () => {
    const redacted = redactLog({ authorization: 'Bearer synthetic', cookie: 'lab_session=synthetic', email: 'alice.learner@example.test', action: 'export' });
    expect(redacted).toEqual({ authorization: '[REDACTED]', cookie: '[REDACTED]', email: 'a***@example.test', action: 'export' });
  });
});

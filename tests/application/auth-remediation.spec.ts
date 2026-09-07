import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../apps/api-gateway/src/auth.service';
import type { Database } from '../../apps/api-gateway/src/database';

const user = {
  id: '10000000-0000-4000-8000-000000000001',
  email: 'alice.learner@example.test',
  role: 'learner',
  password_plain: null,
  password_hash: '$2b$12$7EFDH4JFZgMYh04aDyaz7uqjre0joVBgtaSRXjjG7pdp//BomGdMO',
};

function databaseWith(rows: unknown[]) {
  const query = jest.fn(async (sql: string) => {
    if (sql.startsWith('SELECT id,email,role')) return { rows, rowCount: rows.length };
    return { rows: [], rowCount: 1 };
  });
  return { database: { query } as unknown as Database, query };
}

describe('remédiation applicative de l’authentification', () => {
  beforeEach(() => {
    process.env.LAB_PROFILE = 'remediated';
    process.env.JWT_SECRET = 'synthetic-application-test-secret';
  });

  test('cinq échecs sont normaux puis la limite bornée est appliquée', async () => {
    const { database } = databaseWith([]);
    const service = new AuthService(database);
    const identity = 'bounded-application@example.test';

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(service.login(identity, 'Synthetic-Invalid-2026!')).rejects.toBeInstanceOf(UnauthorizedException);
    }
    await expect(service.login(identity, 'Synthetic-Invalid-2026!')).rejects.toMatchObject({ status: 429 });
  });

  test('un reset contrôlé recrée le limiteur et conserve le parcours légitime', async () => {
    const { database, query } = databaseWith([user]);
    const serviceAfterReset = new AuthService(database);

    const result = await serviceAfterReset.login('alice.learner@example.test', 'Synthetic-Alice-2026!');

    expect(result.expiresIn).toBe(900);
    expect(result.tokenType).toBe('Bearer');
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO sessions'),
      expect.arrayContaining([user.id]),
    );
  });
});

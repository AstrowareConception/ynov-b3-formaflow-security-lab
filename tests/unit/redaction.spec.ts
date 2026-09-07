import { redactLog } from '../../packages/security/src/redaction';

test('les logs expurgent credentials, pseudonymisent l’email et conservent la corrélation', () => {
  expect(redactLog({ correlationId: 'synthetic-correlation', email: 'alice.learner@example.test', authorization: 'Bearer synthetic', nested: { password: 'Synthetic-Only' } })).toEqual({
    correlationId: 'synthetic-correlation', email: 'a***@example.test', authorization: '[REDACTED]', nested: { password: '[REDACTED]' },
  });
});

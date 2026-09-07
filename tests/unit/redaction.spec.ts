import { redactLog } from '../../packages/security/src/redaction';

test('les logs expurgent credentials et conservent la corrélation', () => {
  expect(redactLog({ correlationId: 'synthetic-correlation', authorization: 'Bearer synthetic', nested: { password: 'Synthetic-Only' } })).toEqual({
    correlationId: 'synthetic-correlation', authorization: '[REDACTED]', nested: { password: '[REDACTED]' },
  });
});

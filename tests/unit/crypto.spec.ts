import bcrypt from 'bcrypt';
import { decryptPersonalField, encryptPersonalField } from '../../packages/security/src/crypto';

describe('bcrypt', () => {
  const password = 'Synthetic-Crypto-2026!';
  test('deux sels donnent deux hashes vérifiables', async () => {
    const first = await bcrypt.hash(password, 12);
    const second = await bcrypt.hash(password, 12);
    expect(first).not.toBe(second);
    await expect(bcrypt.compare(password, first)).resolves.toBe(true);
    await expect(bcrypt.compare(password, second)).resolves.toBe(true);
    expect(bcrypt.getRounds(first)).toBe(12);
  });
  test('un mot de passe synthétique distinct est refusé', async () => {
    const hash = await bcrypt.hash(password, 12);
    await expect(bcrypt.compare('Synthetic-Wrong-2026!', hash)).resolves.toBe(false);
  });
});

describe('AES-256-GCM', () => {
  const key = Buffer.alloc(32, 7); // Clé déterministe limitée au processus de test.
  test('aller-retour et nonce unique sur une bio synthétique', () => {
    const first = encryptPersonalField('Bio synthétique chiffrée', key);
    const second = encryptPersonalField('Bio synthétique chiffrée', key);
    expect(first).not.toBe(second);
    expect(decryptPersonalField(first, key)).toBe('Bio synthétique chiffrée');
    expect(decryptPersonalField(second, key)).toBe('Bio synthétique chiffrée');
  });
  test('une altération est détectée', () => {
    const encrypted = encryptPersonalField('Champ personnel synthétique', key);
    const tampered = `${encrypted.slice(0, -1)}${encrypted.endsWith('A') ? 'B' : 'A'}`;
    expect(() => decryptPersonalField(tampered, key)).toThrow();
  });
});

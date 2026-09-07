import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';

export function decodeKey(encoded = process.env.AES_GCM_KEY_BASE64): Buffer {
  if (!encoded) throw new Error('AES_GCM_KEY_BASE64 doit être injectée hors Git');
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) throw new Error('La clé AES-GCM doit contenir exactement 256 bits');
  return key;
}

export function encryptPersonalField(value: string, key = decodeKey()): string {
  const nonce = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, nonce);
  cipher.setAAD(Buffer.from('formaflow:profile:bio:v1'));
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ['v1', nonce.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join('.');
}

export function decryptPersonalField(envelope: string, key = decodeKey()): string {
  const [version, nonceText, tagText, ciphertextText, extra] = envelope.split('.');
  if (version !== 'v1' || !nonceText || !tagText || !ciphertextText || extra) throw new Error('Enveloppe AES-GCM invalide');
  const nonce = Buffer.from(nonceText, 'base64url');
  if (nonce.length !== 12) throw new Error('Nonce AES-GCM invalide');
  const decipher = createDecipheriv(ALGORITHM, key, nonce);
  decipher.setAAD(Buffer.from('formaflow:profile:bio:v1'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextText, 'base64url')), decipher.final()]).toString('utf8');
}

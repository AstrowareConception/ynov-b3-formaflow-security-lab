import { readFileSync } from 'node:fs';

describe('architecture confinée', () => {
  const compose = readFileSync('compose.yml', 'utf8');
  test('chaque port publié est lié à la boucle locale', () => {
    const ports = [...compose.matchAll(/- "([^"]+:[^"]+)"/g)].map((match) => match[1]);
    expect(ports.length).toBeGreaterThan(0);
    expect(ports.every((port) => port.startsWith('127.0.0.1:'))).toBe(true);
  });
  test('le profil vulnérable exige une sélection Compose', () => {
    expect(compose).toContain('profiles: [vulnerable]');
    expect(compose).toContain('name: formaflow-security-lab');
  });
});
